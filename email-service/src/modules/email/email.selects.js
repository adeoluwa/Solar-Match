// Sequelize `attributes` lists.
module.exports = {
  // returned to the worker
  logResponse: ["id", "jobId", "type", "to", "status", "providerId", "sentAt"],

  // duplicate check: need the id to reuse the row, status to know if it already sent
  dedupeCheck: ["id", "status"],

  idOnly: ["id"],
};
