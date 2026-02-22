import * as crud from "./DBMethods.js";
import { executeQuery } from "./DBMethods.js";

export const ModelManager = {
  createModel: (schemaQueries = [], tableName) => {
    let populate = [];

    return {
      tableName,
      getSchemaQueries: () => schemaQueries,
      
      create: (data, client) =>
        crud.create(tableName, data, client),

      find: async (filters = {}, client) => {
        return await executeQuery(tableName, populate, 'find', filters, client);
      },

      findAll: async (client) => {
        return await executeQuery(tableName, populate, 'findAll', {}, client);
      },

      findOne: async (filters = {}, client) => {
        const rows = await executeQuery(tableName, populate, 'findOne', filters, client);
        return rows[0] || null
      },

      findById: async (id, client) => {
        const rows =  await executeQuery(tableName, populate, 'findById', { id }, client);
        return rows[0] || null
      },

      existsById: (id, client) =>
        crud.existsById(tableName, id, client),

      // UPDATE
      updateOne: (filters, data, client) =>
        crud.updateOne(tableName, filters, data, client),

      findByIdAndUpdate: (id, data, client) =>
        crud.findByIdAndUpdate(tableName, id, data, client),

      // DELETE
      deleteOne: (filters, client) =>
        crud.deleteOne(tableName, filters, client),

      findByIdAndDelete: (id, client) =>
        crud.findByIdAndDelete(tableName, id, client),

      populate: function (populateArray = []) {
        populate = populateArray; 
        return this;  
      }
    }
  }
}
