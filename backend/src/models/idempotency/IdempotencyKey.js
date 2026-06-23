
import { ModelManager } from "../../database/utils/ModelManager.js";
import { String } from "../../utils/Constant.js";

import { IdempotencyKeyQueryManager } from "./IdempotencyKeyQueryManager.js";


const IdempotencyKey = ModelManager.createModel(
  IdempotencyKeyQueryManager.schema,
  String.IDEMPOTENCY_KEY
);

export default IdempotencyKey;