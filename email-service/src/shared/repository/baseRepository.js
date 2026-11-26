const db = require("../models");

// Keep only the requested attributes from a plain row (mirrors Prisma's `select`).
function pick(row, attributes) {
  if (!row) return row;
  if (!attributes || attributes.length === 0) return row;
  return attributes.reduce((acc, key) => {
    if (key in row) acc[key] = row[key];
    return acc;
  }, {});
}

/**
 * Generic Sequelize repository. No bespoke methods: callers pass
 * where / attributes / data. Every method takes an optional `tx` so it can run
 * inside a sequelize.transaction(). `attributes` is an array of column names.
 */
function createRepository(modelName) {
  const model = () => db[modelName];

  return {
    findOne({ where, attributes } = {}, tx) {
      return model().findOne({ where, attributes, transaction: tx, raw: true });
    },

    findMany({ where, attributes, order, offset, limit } = {}, tx) {
      return model().findAll({
        where,
        attributes,
        order,
        offset,
        limit,
        transaction: tx,
        raw: true,
      });
    },

    count({ where } = {}, tx) {
      return model().count({ where, transaction: tx });
    },

    async create({ data, attributes }, tx) {
      const row = await model().create(data, { transaction: tx });
      return pick(row.get({ plain: true }), attributes);
    },

    async update({ where, data, attributes }, tx) {
      // returning: true (Postgres) hands back the updated rows
      const [, rows] = await model().update(data, {
        where,
        returning: true,
        transaction: tx,
      });
      const row = rows && rows[0];
      return row ? pick(row.get({ plain: true }), attributes) : null;
    },

    updateMany({ where, data }, tx) {
      return model().update(data, { where, transaction: tx }); // [affectedCount]
    },

    delete({ where }, tx) {
      return model().destroy({ where, transaction: tx }); // affectedCount
    },

    deleteMany({ where }, tx) {
      return model().destroy({ where, transaction: tx }); // affectedCount
    },
  };
}

module.exports = createRepository;
