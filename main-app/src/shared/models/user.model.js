const PHONE_REGEX = /^(?:\+?234|0)\d{10}$/; // Nigerian: 08012345678 or +2348012345678

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Full name is required" },
          len: {
            args: [2, 100],
            msg: "Full name must be between 2 and 100 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Email is already registered" },
        set(value) {
          this.setDataValue("email", String(value).trim().toLowerCase());
        },
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "A valid email is required" },
        },
      },
      phone: {
        // Nullable so the seeded admin needn't have one; required for
        // customer/installer registration at the request-validation layer.
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: PHONE_REGEX,
            msg: "A valid Nigerian phone number is required",
          },
        },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true, // e.g. "Lagos"
      },
      lga: {
        type: DataTypes.STRING,
        allowNull: true, // Local Government Area, e.g. "Ikeja"
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false, // always a bcrypt hash, never plain text
        validate: { notEmpty: { msg: "Password is required" } },
      },
      role: {
        type: DataTypes.ENUM("admin", "customer", "installer"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["admin", "customer", "installer"]],
            msg: "Role must be customer or installer",
          },
        },
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true, // stores a SHA-256 hash of the token, not the token
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    },
  );

  return User;
};
