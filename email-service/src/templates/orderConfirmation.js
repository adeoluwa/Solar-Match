const esc = require("./escape");

const naira = (kobo) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

module.exports = ({ name, orderId, items, total }) => ({
  subject: `Order #${orderId} confirmed`,
  html: `
    <h2>Thanks for your order, ${esc(name)}!</h2>
    <p>Your order <strong>#${orderId}</strong> has been received and is pending.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      ${items
        .map(
          (i) => `<tr>
            <td>${esc(i.name)}</td>
            <td>× ${i.quantity}</td>
            <td>${naira(i.price * i.quantity)}</td>
          </tr>`,
        )
        .join("")}
      <tr>
        <td colspan="2"><strong>Total</strong></td>
        <td><strong>${naira(total)}</strong></td>
      </tr>
    </table>
  `,
});
