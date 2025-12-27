import { ModelManager } from "../../database/utils/ModelManager.js";
import { WalletQueryManager } from "./WalletQueryManager.js";
import { String } from "../../utils/Constant.js";

const Wallet = ModelManager.createModel([
  WalletQueryManager.createWalletTableQuery,
  WalletQueryManager.createWalletTableQueryIndex],
  String.WALLET_MODEL
);

export default Wallet;
