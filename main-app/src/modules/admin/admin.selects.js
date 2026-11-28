// Sequelize `attributes` lists for admin queries

module.exports = {
  // login: needs the hash to compare + role to check the account is an admin
  loginAdmin: [
    "id",
    "fullName",
    "email",
    "role",
    "password"],
};