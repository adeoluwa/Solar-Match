const esc = require("./escape");

module.exports = ({ name }) => ({
  subject: "Welcome!",
  html: `<p>Hi ${esc(name)}, welcome aboard. Your account is ready.</p>`,
});
