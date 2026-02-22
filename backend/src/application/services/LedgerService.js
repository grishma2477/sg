import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import LedgerAccount from "../../models/finance/ledger_account/LedgerAccount.js";
import LedgerEntry from "../../models/finance/ledger_entry/LedgerEntry.js";
import { AppError } from "../../utils/AppError.js";
import { String } from "../../utils/Constant.js";

export class LedgerService {


  static async getOrCreateAccount({ ownerType, ownerId, accountType }) {
    try {
      let account = await LedgerAccount.findOne({
        owner_type: ownerType,
        owner_id: ownerId,
        account_type: accountType
      });

      if (!account) {
        account = await LedgerAccount.create({
          owner_type: ownerType,
          owner_id: ownerId,
          account_type: accountType,
          currency: 'NPR'
        });

        console.log(`✅ Ledger account created: ${ownerType}/${accountType} for ${ownerId}`);
      }

      return account;
    } catch (error) {
      console.error('Error getting/creating ledger account:', error);
      throw new AppError('LEDGER_ACCOUNT_ERROR', 500);
    }
  }

  static async getPlatformAccount(accountType) {
    try {
      const account = await LedgerAccount.findOne({
        owner_type: 'platform',
        account_type: accountType
      });

      if (!account) {
        throw new AppError('PLATFORM_ACCOUNT_NOT_FOUND', 500, { accountType });
      }

      return account;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting platform account:', error);
      throw new AppError('PLATFORM_ACCOUNT_ERROR', 500);
    }
  }


  static async createEntry({
    debitAccountId,
    creditAccountId,
    amount,
    referenceType,
    referenceId,
    description,
    client = null
  }) {
    try {
      const entry = await LedgerEntry.create({
        debit_account_id: debitAccountId,
        credit_account_id: creditAccountId,
        amount: amount.toFixed(2),
        currency: 'NPR',
        reference_type: referenceType,
        reference_id: referenceId,
        description
      }, client);

      console.log(`📊 Ledger entry: ${referenceType} - ₹${amount}`);

      return entry;
    } catch (error) {
      console.error('Error creating ledger entry:', error);
      throw new AppError('LEDGER_ENTRY_ERROR', 500);
    }
  }


  static async getAccountBalance(accountId) {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN credit_account_id = $1 THEN amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN debit_account_id = $1 THEN amount ELSE 0 END), 0) AS balance
        FROM ${String.LEDGER_ENTRY}
        WHERE credit_account_id = $1 OR debit_account_id = $1
      `, [accountId]);

      return parseFloat(result.rows[0].balance) || 0;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw new AppError('BALANCE_CALCULATION_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET USER WALLET BALANCE
  // ═══════════════════════════════════════════════════════════

  static async getUserWalletBalance(userId, ownerType = 'user') {
    try {
      const account = await this.getOrCreateAccount({
        ownerType,
        ownerId: userId,
        accountType: 'wallet'
      });

      const balance = await this.getAccountBalance(account.id);

      return {
        accountId: account.id,
        balance,
        currency: 'NPR'
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw new AppError('GET_BALANCE_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSFER FUNDS (DOUBLE-ENTRY)
  // ═══════════════════════════════════════════════════════════

  static async transferFunds({
    fromAccountId,
    toAccountId,
    amount,
    referenceType,
    referenceId,
    description
  }) {
    return await withTransaction(async (client) => {
      // Verify sufficient balance
      const balance = await this.getAccountBalance(fromAccountId);
      if (balance < amount) {
        throw new AppError('INSUFFICIENT_BALANCE', 400, {
          available: balance,
          required: amount
        });
      }

      // Create ledger entry
      const entry = await this.createEntry({
        debitAccountId: fromAccountId,
        creditAccountId: toAccountId,
        amount,
        referenceType,
        referenceId,
        description,
        client
      });

      return entry;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GET ACCOUNT HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getAccountHistory(accountId, limit = 50) {
    try {
      const entries = await pool.query(`
        SELECT 
          le.*,
          CASE 
            WHEN le.debit_account_id = $1 THEN 'debit'
            ELSE 'credit'
          END as entry_type,
          CASE 
            WHEN le.debit_account_id = $1 THEN le.credit_account_id
            ELSE le.debit_account_id
          END as counterparty_account_id
        FROM ${String.LEDGER_ENTRY} le
        WHERE le.debit_account_id = $1 OR le.credit_account_id = $1
        ORDER BY le.created_at DESC
        LIMIT $2
      `, [accountId, limit]);

      return entries.rows;
    } catch (error) {
      console.error('Error getting account history:', error);
      throw new AppError('GET_HISTORY_ERROR', 500);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // AUTHORIZE PAYMENT (LOCK FUNDS IN ESCROW)
  // ═══════════════════════════════════════════════════════════

  static async authorizePayment({
    userId,
    amount,
    rideId,
    paymentSource
  }) {
    return await withTransaction(async (client) => {
      let sourceAccount;
      let platformEscrow = await this.getPlatformAccount('escrow');

      // Determine source account based on payment source
      if (paymentSource === 'wallet') {
        sourceAccount = await this.getOrCreateAccount({
          ownerType: 'user',
          ownerId: userId,
          accountType: 'wallet'
        });
      } else if (paymentSource === 'gift') {
        sourceAccount = await this.getPlatformAccount('gift');
      } else if (paymentSource === 'bnpl') {
        sourceAccount = await this.getPlatformAccount('bnpl');
      } else if (paymentSource === 'gateway') {
        sourceAccount = await this.getPlatformAccount('clearing');
      } else {
        // Cash - no authorization needed
        return null;
      }

      // Verify balance
      const balance = await this.getAccountBalance(sourceAccount.id);
      if (balance < amount) {
        throw new AppError('INSUFFICIENT_FUNDS', 400, {
          available: balance,
          required: amount
        });
      }

      // Move to escrow
      const entry = await this.createEntry({
        debitAccountId: sourceAccount.id,
        creditAccountId: platformEscrow.id,
        amount,
        referenceType: 'ride_authorization',
        referenceId: rideId,
        description: `Payment authorization for ride ${rideId}`,
        client
      });

      console.log(`🔒 Authorized ₹${amount} for ride ${rideId}`);

      return entry;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SETTLE PAYMENT (ESCROW → DRIVER + PLATFORM)
  // ═══════════════════════════════════════════════════════════

  static async settlePayment({
    rideId,
    driverId,
    totalAmount,
    platformFee
  }) {
    return await withTransaction(async (client) => {
      const platformEscrow = await this.getPlatformAccount('escrow');
      const platformRevenue = await this.getPlatformAccount('revenue');
      const driverWallet = await this.getOrCreateAccount({
        ownerType: 'driver',
        ownerId: driverId,
        accountType: 'wallet'
      });

      const driverAmount = totalAmount - platformFee;

      // Escrow → Driver
      await this.createEntry({
        debitAccountId: platformEscrow.id,
        creditAccountId: driverWallet.id,
        amount: driverAmount,
        referenceType: 'settlement',
        referenceId: rideId,
        description: `Driver payout for ride ${rideId}`,
        client
      });

      // Escrow → Platform Revenue
      if (platformFee > 0) {
        await this.createEntry({
          debitAccountId: platformEscrow.id,
          creditAccountId: platformRevenue.id,
          amount: platformFee,
          referenceType: 'commission',
          referenceId: rideId,
          description: `Platform commission for ride ${rideId}`,
          client
        });
      }

      console.log(`💰 Settled ride ${rideId}: Driver ₹${driverAmount}, Platform ₹${platformFee}`);

      return { driverAmount, platformFee };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // REFUND PAYMENT (ESCROW → ORIGINAL SOURCE)
  // ═══════════════════════════════════════════════════════════

  static async refundPayment({
    userId,
    amount,
    rideId,
    paymentSource
  }) {
    return await withTransaction(async (client) => {
      const platformEscrow = await this.getPlatformAccount('escrow');
      let destinationAccount;

      if (paymentSource === 'wallet') {
        destinationAccount = await this.getOrCreateAccount({
          ownerType: 'user',
          ownerId: userId,
          accountType: 'wallet'
        });
      } else if (paymentSource === 'gift') {
        destinationAccount = await this.getPlatformAccount('gift');
      } else if (paymentSource === 'bnpl') {
        destinationAccount = await this.getPlatformAccount('bnpl');
      } else {
        // Cash - no refund needed
        return null;
      }

      // Escrow → Original Source
      const entry = await this.createEntry({
        debitAccountId: platformEscrow.id,
        creditAccountId: destinationAccount.id,
        amount,
        referenceType: 'ride_cancellation',
        referenceId: rideId,
        description: `Refund for cancelled ride ${rideId}`,
        client
      });

      console.log(`↩️ Refunded ₹${amount} for ride ${rideId}`);

      return entry;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PROCESS PAYOUT (DRIVER WALLET → CLEARING)
  // ═══════════════════════════════════════════════════════════

  static async processPayout({
    driverId,
    amount,
    payoutRequestId
  }) {
    return await withTransaction(async (client) => {
      const driverWallet = await this.getOrCreateAccount({
        ownerType: 'driver',
        ownerId: driverId,
        accountType: 'wallet'
      });

      const balance = await this.getAccountBalance(driverWallet.id);
      if (balance < amount) {
        throw new AppError('INSUFFICIENT_PAYOUT_BALANCE', 400, {
          available: balance,
          required: amount
        });
      }

      const payoutClearing = await this.getPlatformAccount('clearing');

      // Driver Wallet → Payout Clearing
      const entry = await this.createEntry({
        debitAccountId: driverWallet.id,
        creditAccountId: payoutClearing.id,
        amount,
        referenceType: 'payout',
        referenceId: payoutRequestId,
        description: `Driver payout request ${payoutRequestId}`,
        client
      });

      console.log(`💸 Payout processed: ₹${amount} for driver ${driverId}`);

      return entry;
    });
  }
}