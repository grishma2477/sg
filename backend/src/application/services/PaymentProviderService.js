import PaymentProvider from "../../models/finance/payment_method/payment_provider/PaymentProvider.js";
import { pool } from "../../database/DBConnection.js";

export class PaymentProviderService {

  static async createProvider(data) {

    const provider = await PaymentProvider.create({
      ...data,
      type: data.type.toLowerCase()
    });

    return provider;
  }

  static async getUserAvailableProviders() {
  const query = `
    SELECT 
      id,
      provider_name,
      provider_type,
      is_active,
      COALESCE(is_user_enabled, true) AS is_user_enabled
    FROM payment_provider
    WHERE is_active = true
      AND COALESCE(is_user_enabled, true) = true
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}
  static async updateProvider(id, data) {

    await PaymentProvider.updateOne(
      { id },
      data
    );

    return { id };
  }

  static async deactivateProvider(id) {

    await PaymentProvider.updateOne(
      { id },
      { is_active: false }
    );

    return { id };
  }

  static async getAllProviders() {

    return PaymentProvider.findAll({
      is_deleted: false
    });

  }

}