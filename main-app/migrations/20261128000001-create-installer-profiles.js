"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("installer_profiles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      businessEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactPersonName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      businessPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRegisteredBusiness: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      businessAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serviceState: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serviceLga: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      businessDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Plain string; allowed values are enforced in the application layer.
      verificationStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("installer_profiles", ["verificationStatus"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("installer_profiles");
  },
};
