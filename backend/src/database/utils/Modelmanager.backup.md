import { pool } from "../DBConnection.js";
import * as crud from "./DBMethods.js"


export const ModelManager = {
  createModel: (tableCreateQuery, tableName, customQueries = {}) => {
    // Optionally create table on first load
    pool.query(tableCreateQuery).catch(err => {
      console.error(`Error creating table "${tableName}":`, err);
    });

    // Base CRUD methods
    const model = {
      // CREATE
      create: (data) => crud.create(tableName, data),

      // READ
      find: (filters = {}) => crud.find(tableName, filters),
      findAll: () => crud.findAll(tableName),
      findOne: (filters = {}) => crud.findOne(tableName, filters),
      findById: (id) => crud.findById(tableName, id),
      existsById: (id) => crud.existsById(tableName, id),

      // UPDATE
      updateOne: (filters, data) => crud.updateOne(tableName, filters, data),
      findByIdAndUpdate: (id, data) => crud.findByIdAndUpdate(tableName, id, data),

      // DELETE
      deleteOne: (filters) => crud.deleteOne(tableName, filters),
      findByIdAndDelete: (id) => crud.findByIdAndDelete(tableName, id),
    };

    // Add custom queries dynamically
    Object.keys(customQueries).forEach(key => {
      model[key] = async (...params) => {
        const { rows } = await pool.query(customQueries[key], params);
        return rows;
      };
    });

    return model;
  }
};
