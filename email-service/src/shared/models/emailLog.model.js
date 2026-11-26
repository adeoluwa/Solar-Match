module.exports = (sequelize, DataTypes) => {
  const EmailLog = sequelize.define(
    "EmailLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // BullMQ job id — prevents double-sending on retry
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false, // welcome | password_reset | order_confirmation
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: { msg: "A valid recipient email is required" } },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // pending | sent | failed
      },
      providerId: {
        type: DataTypes.STRING,
        allowNull: true, // Resend's email id
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "email_logs",
      timestamps: true,
      createdAt: true,
      updatedAt: false, // matches the reference: created + sentAt only
    },
  );

  return EmailLog;
};
