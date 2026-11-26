/**
 * @openapi
 * tags:
 *   - name: Email
 *     description: Send transactional emails (internal, worker only)
 *
 * components:
 *   schemas:
 *     SendEmailInput:
 *       type: object
 *       required: [type, to, data]
 *       properties:
 *         type:
 *           type: string
 *           enum: [welcome, password_reset, order_confirmation]
 *         to:
 *           type: string
 *           format: email
 *         jobId:
 *           type: string
 *           description: BullMQ job id. Same jobId is never sent twice.
 *         data:
 *           type: object
 *           description: Shape depends on type (see examples)
 *
 *     EmailLog:
 *       type: object
 *       properties:
 *         id:         { type: integer, example: 1 }
 *         jobId:      { type: string, example: "42" }
 *         type:       { type: string, example: welcome }
 *         to:         { type: string, example: ada@example.com }
 *         status:     { type: string, example: sent }
 *         providerId: { type: string, example: 4ef9a417-02e9-4d39-ad75-9611e0fcc33c }
 *         sentAt:     { type: string, format: date-time }
 */

/**
 * @openapi
 * /email/send:
 *   post:
 *     tags: [Email]
 *     summary: Send an email
 *     description: Renders the template for `type`, sends it with Resend and logs the result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SendEmailInput' }
 *           examples:
 *             welcome:
 *               summary: Welcome email
 *               value:
 *                 type: welcome
 *                 to: ada@example.com
 *                 jobId: "1"
 *                 data: { name: Ada Obi }
 *             passwordReset:
 *               summary: Password reset
 *               value:
 *                 type: password_reset
 *                 to: ada@example.com
 *                 jobId: "2"
 *                 data:
 *                   name: Ada Obi
 *                   resetUrl: http://localhost:5173/reset-password?token=abc123
 *             orderConfirmation:
 *               summary: Order confirmation
 *               value:
 *                 type: order_confirmation
 *                 to: ada@example.com
 *                 jobId: "3"
 *                 data:
 *                   name: Ada Obi
 *                   orderId: 17
 *                   total: 450000
 *                   items:
 *                     - { name: Wireless Mouse, quantity: 2, price: 150000 }
 *                     - { name: USB-C Cable, quantity: 1, price: 150000 }
 *     responses:
 *       200:
 *         description: Sent, or already sent for this jobId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Email sent }
 *                 data:    { $ref: '#/components/schemas/EmailLog' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       401:
 *         description: Missing or invalid x-api-key
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       502:
 *         description: Resend rejected or failed; safe to retry
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */