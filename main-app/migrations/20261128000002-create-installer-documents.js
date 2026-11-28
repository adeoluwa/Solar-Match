"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("installer_documents", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      installerProfileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "installer_profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Plain string; allowed document types are enforced in the application layer.
      documentType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      storageKey: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "application/pdf",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // One document of each type per installer (re-upload replaces).
    await queryInterface.addIndex(
      "installer_documents",
      ["installerProfileId", "documentType"],
      { unique: true, name: "installer_documents_profile_type_unique" },
    );
  },

  async down(queryInterface) {
    // Dropping the table drops its indexes with it (an index belongs to its
    // table in Postgres), so there's no need to drop the index separately.
    await queryInterface.dropTable("installer_documents");
  },
};
