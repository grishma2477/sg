import { ModelManager } from '../../database/utils/ModelManager.js';
import { TransactionQueryManager } from './TransactionQueryManager.js';
import { String } from '../../utils/Constant.js';

const Transaction = ModelManager.createModel(
  TransactionQueryManager.createTransactionTableQuery,
  String.TRANSACTION_MODEL
);

export default Transaction;
