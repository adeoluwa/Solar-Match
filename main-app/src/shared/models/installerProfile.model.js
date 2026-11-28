const { VERIFICATION_STATUS } = require("../constants/installerVerification");

const PHONE_REGEX = /^(?:\+?234|0)\d{10}$/; // Nigerian: 08012345678 or +2348012345678

module.exports = (sequelize, DataTypes) => {
  const InstallerProfile = sequelize.define(
    "InstallerProfile",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // One business profile per installer user.
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: { msg: "This installer already has a business profile" },
      },

      // --- Required business information ---
      businessName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Business name is required" } },
      },
      businessEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue(
            "businessEmail",
            String(value).trim().toLowerCase(),
          );
        },
        validate: {
          notEmpty: { msg: "Business email is required" },
          isEmail: { msg: "A valid business email is required" },
        },
      },
      contactPersonName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: { msg: "Contact person's name is required" } },
      },
      // Business phone / WhatsApp number.
      businessPhone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: PHONE_REGEX,
            msg: "A valid Nigerian phone/WhatsApp number is required",
          },
        },
      },
      // Drives the conditional CAC requirement at submission time.
      isRegisteredBusiness: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // --- Optional business information ---
      businessAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      serviceState: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. "Lagos"
      },
      serviceLga: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. "Ikeja"
      },
      businessDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // --- Verification lifecycle ---
      // Plain string in the DB; allowed values live in the constants and are
      // enforced in the service/validation layer (no Postgres enum type).
      verificationStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: VERIFICATION_STATUS.PENDING,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true, // set only when an admin rejects
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true, // when the installer submitted for review
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // admin user id who made the decision
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "installer_profiles",
      timestamps: true,
    },
  );

  InstallerProfile.associate = (db) => {
    InstallerProfile.belongsTo(db.User, { foreignKey: "userId", as: "user" });
    InstallerProfile.hasMany(db.InstallerDocument, {
      foreignKey: "installerProfileId",
      as: "documents",
    });
  };

  return InstallerProfile;
};
