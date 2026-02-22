import { pool } from "../../database/DBConnection.js";
import { withTransaction } from "../../infrastructure/transactions/withTransaction.js";
import Wallet from "../../models/finance/transaction/wallet/Wallet.js";
import Transaction from "../../models/finance/transaction/Transaction.js";
import { AppError } from "../../utils/AppError.js";
import { v4 as uuidv4 } from 'uuid';

export class WalletService {

  // ═══════════════════════════════════════════════════════════
  // GET OR CREATE WALLET
  // ═══════════════════════════════════════════════════════════

  static async getOrCreateWallet(userId, client = pool) {
    try {
      let wallet = await Wallet.findOne({ user_id: userId }, client);
      
      if (!wallet) {
        wallet = await Wallet.create({
          user_id: userId,
          balance: 0.00,
          locked_balance: 0.00,
          currency: 'NPR'
        }, client);
      }
      
      return wallet;
    } catch (error) {
      console.error('Error getting/creating wallet:', error);
      throw new AppError('WALLET_FETCH_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET WALLET BALANCE
  // ═══════════════════════════════════════════════════════════

  static async getWalletBalance(userId) {
    try {
      console.log(userId)
      const wallet = await Wallet.findOne({ user_id: userId });
      
      if (!wallet) {
        throw new AppError('WALLET_NOT_FOUND', 404, { userId });
      }

      const availableBalance = wallet.balance - wallet.locked_balance;

      return {
        balance: parseFloat(wallet.balance),
        lockedBalance: parseFloat(wallet.locked_balance),
        availableBalance: parseFloat(availableBalance),
        currency: wallet.currency,
        dailyWithdrawalLimit: parseFloat(wallet.daily_withdrawal_limit),
        todayWithdrawn: parseFloat(wallet.today_withdrawn),
        isLocked: wallet.is_locked
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting wallet balance:', error);
      throw new AppError('WALLET_BALANCE_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TOP-UP WALLET
  // ═══════════════════════════════════════════════════════════

  static async topUpWallet({ 
    userId, 
    amount, 
    paymentMethod, 
    paymentGateway = null,
    gatewayTransactionId = null,
    metadata = {}
  }) {
    if (amount <= 0) {
      throw new AppError('INVALID_AMOUNT', 400, { amount });
    }

    return await withTransaction(async (client) => {
      const wallet = await Wallet.findOne({ user_id: userId }, client);
      
      if (!wallet) {
        throw new AppError('WALLET_NOT_FOUND', 404, { userId });
      }

      if (wallet.is_locked) {
        throw new AppError('WALLET_LOCKED', 403, { 
          reason: wallet.lock_reason 
        });
      }

      const balanceBefore = parseFloat(wallet.balance);
      const newBalance = balanceBefore + amount;

      const updatedWallet = await Wallet.updateOne(
        { user_id: userId },
        { balance: newBalance.toFixed(2) },
        client
      );

      const transaction = await Transaction.create({
        user_id: userId,
        type: 'credit',
        category: 'wallet_topup',
        amount: amount.toFixed(2),
        currency: 'NPR',
        balance_before: balanceBefore.toFixed(2),
        balance_after: newBalance.toFixed(2),
        status: 'completed',
        payment_method: paymentMethod,
        payment_gateway: paymentGateway,
        gateway_transaction_id: gatewayTransactionId,
        description: `Wallet top-up via ${paymentMethod}`,
        metadata: JSON.stringify(metadata),
        idempotency_key: uuidv4()
      }, client);

      console.log(`✅ Wallet topped up: ${userId} +₹${amount}`);

      return {
        wallet: updatedWallet,
        transaction
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // WITHDRAW FROM WALLET
  // ═══════════════════════════════════════════════════════════

  static async withdrawFromWallet({
    userId,
    amount,
    bankDetails,
    metadata = {}
  }) {
    if (amount <= 0) {
      throw new AppError('INVALID_AMOUNT', 400, { amount });
    }

    return await withTransaction(async (client) => {
      const wallet = await Wallet.findOne({ user_id: userId }, client);
      
      if (!wallet) {
        throw new AppError('WALLET_NOT_FOUND', 404, { userId });
      }

      if (wallet.is_locked) {
        throw new AppError('WALLET_LOCKED', 403, { 
          reason: wallet.lock_reason 
        });
      }

      const availableBalance = wallet.balance - wallet.locked_balance;

      if (availableBalance < amount) {
        throw new AppError('INSUFFICIENT_BALANCE', 400, {
          available: availableBalance,
          required: amount
        });
      }

      const todayWithdrawn = wallet.last_withdrawal_date === new Date().toISOString().split('T')[0]
        ? wallet.today_withdrawn 
        : 0;
      
      const remainingLimit = wallet.daily_withdrawal_limit - todayWithdrawn;
      
      if (amount > remainingLimit) {
        throw new AppError('DAILY_LIMIT_EXCEEDED', 400, {
          limit: wallet.daily_withdrawal_limit,
          todayWithdrawn,
          remainingLimit
        });
      }

      const balanceBefore = parseFloat(wallet.balance);
      const newBalance = balanceBefore - amount;
      const newTodayWithdrawn = todayWithdrawn + amount;

      const updatedWallet = await Wallet.updateOne(
        { user_id: userId },
        { 
          balance: newBalance.toFixed(2),
          today_withdrawn: newTodayWithdrawn.toFixed(2),
          last_withdrawal_date: new Date().toISOString().split('T')[0]
        },
        client
      );

      const transaction = await Transaction.create({
        user_id: userId,
        type: 'debit',
        category: 'wallet_withdrawal',
        amount: amount.toFixed(2),
        currency: 'NPR',
        balance_before: balanceBefore.toFixed(2),
        balance_after: newBalance.toFixed(2),
        status: 'completed',
        payment_method: 'bank_transfer',
        description: `Withdrawal to bank account`,
        metadata: JSON.stringify({ ...metadata, bankDetails }),
        idempotency_key: uuidv4()
      }, client);

      console.log(`✅ Withdrawal processed: ${userId} -₹${amount}`);

      return {
        wallet: updatedWallet,
        transaction
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // TRANSFER BETWEEN USERS
  // ═══════════════════════════════════════════════════════════

  static async transferFunds({
    fromUserId,
    toUserId,
    amount,
    description = 'Wallet transfer',
    metadata = {}
  }) {
    if (amount <= 0) {
      throw new AppError('INVALID_AMOUNT', 400, { amount });
    }

    if (fromUserId === toUserId) {
      throw new AppError('CANNOT_TRANSFER_TO_SELF', 400);
    }

    return await withTransaction(async (client) => {
      const fromWallet = await Wallet.findOne({ user_id: fromUserId }, client);
      const toWallet = await Wallet.findOne({ user_id: toUserId }, client);

      if (!fromWallet) {
        throw new AppError('SENDER_WALLET_NOT_FOUND', 404, { userId: fromUserId });
      }

      if (!toWallet) {
        throw new AppError('RECIPIENT_WALLET_NOT_FOUND', 404, { userId: toUserId });
      }

      if (fromWallet.is_locked) {
        throw new AppError('SENDER_WALLET_LOCKED', 403);
      }

      if (toWallet.is_locked) {
        throw new AppError('RECIPIENT_WALLET_LOCKED', 403);
      }

      const fromAvailable = fromWallet.balance - fromWallet.locked_balance;
      
      if (fromAvailable < amount) {
        throw new AppError('INSUFFICIENT_BALANCE', 400, {
          available: fromAvailable,
          required: amount
        });
      }

      const fromBalanceBefore = parseFloat(fromWallet.balance);
      const toBalanceBefore = parseFloat(toWallet.balance);
      const fromNewBalance = fromBalanceBefore - amount;
      const toNewBalance = toBalanceBefore + amount;

      await Wallet.updateOne(
        { user_id: fromUserId },
        { balance: fromNewBalance.toFixed(2) },
        client
      );

      await Wallet.updateOne(
        { user_id: toUserId },
        { balance: toNewBalance.toFixed(2) },
        client
      );

      const debitTxn = await Transaction.create({
        user_id: fromUserId,
        related_user_id: toUserId,
        type: 'debit',
        category: 'wallet_transfer',
        amount: amount.toFixed(2),
        currency: 'NPR',
        balance_before: fromBalanceBefore.toFixed(2),
        balance_after: fromNewBalance.toFixed(2),
        status: 'completed',
        description: `Transfer to user ${toUserId}`,
        metadata: JSON.stringify(metadata),
        idempotency_key: uuidv4()
      }, client);

      const creditTxn = await Transaction.create({
        user_id: toUserId,
        related_user_id: fromUserId,
        type: 'credit',
        category: 'wallet_transfer',
        amount: amount.toFixed(2),
        currency: 'NPR',
        balance_before: toBalanceBefore.toFixed(2),
        balance_after: toNewBalance.toFixed(2),
        status: 'completed',
        reference_id: debitTxn.id,
        description: `Transfer from user ${fromUserId}`,
        metadata: JSON.stringify(metadata),
        idempotency_key: uuidv4()
      }, client);

      console.log(`✅ Transfer completed: ${fromUserId} → ${toUserId} ₹${amount}`);

      return {
        fromWallet: await Wallet.findOne({ user_id: fromUserId }, client),
        toWallet: await Wallet.findOne({ user_id: toUserId }, client),
        debitTransaction: debitTxn,
        creditTransaction: creditTxn
      };
    });
  }

  // ═══════════════════════════════════════════════════════════
  // LOCK/UNLOCK WALLET (ADMIN)
  // ═══════════════════════════════════════════════════════════

  static async lockWallet(userId, reason, adminId) {
    try {
      const wallet = await Wallet.updateOne(
        { user_id: userId },
        { 
          is_locked: true,
          lock_reason: reason
        }
      );
      
      console.log(`🔒 Wallet locked: ${userId} by admin ${adminId}`);
      
      return wallet;
    } catch (error) {
      console.error('Error locking wallet:', error);
      throw new AppError('WALLET_LOCK_ERROR', 500, { userId });
    }
  }

  static async unlockWallet(userId, adminId) {
    try {
      const wallet = await Wallet.updateOne(
        { user_id: userId },
        { 
          is_locked: false,
          lock_reason: null
        }
      );
      
      console.log(`🔓 Wallet unlocked: ${userId} by admin ${adminId}`);
      
      return wallet;
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      throw new AppError('WALLET_UNLOCK_ERROR', 500, { userId });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // GET TRANSACTION HISTORY
  // ═══════════════════════════════════════════════════════════

  static async getTransactionHistory(userId, filters = {}) {
    try {
      const query = { user_id: userId };
      
      if (filters.category) query.category = filters.category;
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      
      const transactions = await Transaction.find(query);
      
      return transactions.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, filters.limit || 50);
      
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new AppError('TRANSACTION_HISTORY_ERROR', 500, { userId });
    }
  }
}