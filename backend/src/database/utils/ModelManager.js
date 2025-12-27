import { pool } from "../DBConnection.js";
import * as crud from "./DBMethods.js";

export const ModelManager = {
  createModel: (tableCreateQuery, tableName, customQueries = {}) => {
    // Auto-create table (Phase-1 behavior)
    pool.query(tableCreateQuery).catch(err => {
      console.error(`Error creating table "${tableName}":`, err);
    });

    const model = {
      // CREATE
      create: (data, client) =>
        crud.create(tableName, data, client),

      // READ
      find: (filters = {}, client) =>
        crud.find(tableName, filters, client),

      findAll: (client) =>
        crud.find(tableName, {}, client),

      findOne: (filters = {}, client) =>
        crud.findOne(tableName, filters, client),

      findById: (id, client) =>
        crud.findById(tableName, id, client),

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
    };

    // Custom queries
    Object.keys(customQueries).forEach(key => {
      model[key] = async (params = [], client = pool) => {
        const { rows } = await client.query(customQueries[key], params);
        return rows;
      };
    });

    return model;
  }
};
