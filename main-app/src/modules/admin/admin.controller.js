const adminService = require("./admin.service");

async function login(req, res) {
  const result = await adminService.login(req.body);

  res
    .status(200)
    .json({ success: true, message: "Admin login successful", data: result });
}

module.exports = { login };