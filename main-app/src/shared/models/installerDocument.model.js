module.exports = (sequelize, DataTypes) => {
  const InstallerDocument = sequelize.define(
    "InstallerDocument",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      installerProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Plain string; the allowed document types are validated in the
      // service/validation layer, not pinned to a Postgres enum type.
      documentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Filebase object key. The file itself lives in the bucket, never the DB;
      // this is the durable pointer we persist. Presigned URLs are minted on read.
      storageKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Original filename, shown to the admin during review.
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true, // bytes
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "application/pdf",
      },
    },
    {
      tableName: "installer_documents",
      timestamps: true,
      indexes: [
        // One document of each type per installer: re-uploading replaces it.
        {
          unique: true,
          fields: ["installerProfileId", "documentType"],
        },
      ],
    },
  );

  InstallerDocument.associate = (db) => {
    InstallerDocument.belongsTo(db.InstallerProfile, {
      foreignKey: "installerProfileId",
      as: "profile",
    });
  };

  return InstallerDocument;
};
