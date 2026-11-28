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

/**
 * @openapi
 * /admin/installers:
 *   get:
 *     tags: [Admin]
 *     summary: List installer submissions (verification queue)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema: { type: string, enum: [pending, inReview, verified, rejected] }
 *         description: Filter by verification status (e.g. inReview for the review queue)
 *     responses:
 *       200:
 *         description: A list of installer profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/InstallerProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Not an admin }
 */

/**
 * @openapi
 * /admin/installers/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: View one installer submission with documents
 *     description: Returns the profile, the applicant's account, and each document with a presigned URL to open the PDF.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The installer profile, applicant and documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/InstallerProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @openapi
 * /admin/installers/{id}/review:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve or reject an installer submission
 *     description: Only a submission with status inReview can be decided. Rejecting requires a reason; approving grants the verified badge.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision:        { type: string, enum: [verified, rejected] }
 *               rejectionReason: { type: string, description: Required when decision is rejected, example: "Proof of address is illegible" }
 *     responses:
 *       200:
 *         description: Decision applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Installer verified }
 *                 data:    { $ref: '#/components/schemas/InstallerProfile' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: The submission is not in a reviewable state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
