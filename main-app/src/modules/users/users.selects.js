// Sequelize `attributes` lists: choose only the columns each query needs.
module.exports = {
  // returned to the client (never includes the password hash)
  publicUser: [
    "id",
    "fullName",
    "email",
    "phone",
    "state",
    "lga",
    "role",
    "createdAt",
  ],

  // existence check: just need to know a row is there
  idOnly: ["id"],

  // login: needs the hash to compare + role to enforce the toggle
  loginUser: [
    "id",
    "fullName",
    "email",
    "phone",
    "state",
    "lga",
    "role",
    "password",
  ],

  // forgot-password: needs name + email for the email job
  resetRecipient: ["id", "fullName", "email"],
};
