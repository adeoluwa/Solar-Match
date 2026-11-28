/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin login (admin accounts are seeded, not registered)
 */

/**
 * @openapi
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Log in as an admin
 *     description: Only admin accounts can use this login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: admin@solar.local }
 *               password: { type: string, example: your-admin-password }
 *     responses:
 *       200:
 *         description: Admin logged in. Returns a JWT and the admin user.
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: The account exists but is not an admin
 */