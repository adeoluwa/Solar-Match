const createRepository = require("../../shared/repository/baseRepository");

module.exports = {
  profiles: createRepository("InstallerProfile"),
  documents: createRepository("InstallerDocument"),
};
