/**
 * @openapi
 * tags:
 *   - name: Installers
 *     description: Installer business profile, document uploads and verification submission
 *
 * components:
 *   schemas:
 *     InstallerProfileInput:
 *       type: object
 *       required: [businessName, businessEmail, contactPersonName, businessPhone]
 *       properties:
 *         businessName:         { type: string, example: BrightSun Energy Ltd }
 *         businessEmail:        { type: string, format: email, example: info@brightsun.ng }
 *         contactPersonName:    { type: string, example: Ada Obi }
 *         businessPhone:        { type: string, example: "08012345678", description: Phone or WhatsApp number }
 *         isRegisteredBusiness: { type: boolean, example: true, description: If true, a CAC certificate is required to submit }
 *         businessAddress:      { type: string, example: "12 Allen Avenue, Ikeja" }
 *         serviceState:         { type: string, example: Lagos }
 *         serviceLga:           { type: string, example: Ikeja }
 *         businessDescription:  { type: string, example: "Residential and commercial solar installations." }
 *
 *     InstallerDocument:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 5 }
 *         documentType: { type: string, enum: [government_id, proof_of_address, training_certificate, previous_projects, cac_certificate, tin, professional_membership, manufacturer_authorisation, customer_reference] }
 *         fileName:     { type: string, example: national-id.pdf }
 *         fileSize:     { type: integer, example: 482113 }
 *         mimeType:     { type: string, example: application/pdf }
 *         url:          { type: string, description: Short-lived presigned GET URL (minted on read, not stored) }
 *         createdAt:    { type: string, format: date-time }
 *
 *     InstallerProfile:
 *       type: object
 *       properties:
 *         id:                   { type: integer, example: 12 }
 *         businessName:         { type: string }
 *         businessEmail:        { type: string, format: email }
 *         contactPersonName:    { type: string }
 *         businessPhone:        { type: string }
 *         isRegisteredBusiness: { type: boolean }
 *         businessAddress:      { type: string, nullable: true }
 *         serviceState:         { type: string, nullable: true }
 *         serviceLga:           { type: string, nullable: true }
 *         businessDescription:  { type: string, nullable: true }
 *         verificationStatus:   { type: string, enum: [pending, inReview, verified, rejected], example: pending }
 *         rejectionReason:      { type: string, nullable: true }
 *         submittedAt:          { type: string, format: date-time, nullable: true }
 *         documents:
 *           type: array
 *           items: { $ref: '#/components/schemas/InstallerDocument' }
 */

/**
 * @openapi
 * /installers/profile:
 *   get:
 *     tags: [Installers]
 *     summary: Get my business profile with documents
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: The installer's profile and uploaded documents (each with a presigned URL)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/InstallerProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   post:
 *     tags: [Installers]
 *     summary: Create or update my business profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InstallerProfileInput' }
 *     responses:
 *       200:
 *         description: Profile saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Business profile saved }
 *                 data:    { $ref: '#/components/schemas/InstallerProfile' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409:
 *         description: Profile is under review or already verified and can't be changed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @openapi
 * /installers/documents:
 *   post:
 *     tags: [Installers]
 *     summary: Upload one or more verification documents (PDF only, max 5 MB each)
 *     description: >
 *       Send all documents in a single multipart request, one field per document
 *       type (field name = the type, e.g. `government_id`). Include only the types
 *       you're uploading; one file per field. Re-uploading a type replaces the
 *       previous file. Returns the array of created/updated documents.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: One optional file field per document type (each a PDF).
 *             properties:
 *               government_id:              { type: string, format: binary }
 *               proof_of_address:           { type: string, format: binary }
 *               training_certificate:       { type: string, format: binary }
 *               previous_projects:          { type: string, format: binary }
 *               cac_certificate:            { type: string, format: binary }
 *               tin:                        { type: string, format: binary }
 *               professional_membership:    { type: string, format: binary }
 *               manufacturer_authorisation: { type: string, format: binary }
 *               customer_reference:         { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Documents uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 4 document(s) uploaded }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/InstallerDocument' }
 *       400:
 *         description: Not a PDF, too large, no file, or an unknown document-type field
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @openapi
 * /installers/documents/{documentId}:
 *   delete:
 *     tags: [Installers]
 *     summary: Delete one of my documents
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Document removed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @openapi
 * /installers/submit:
 *   post:
 *     tags: [Installers]
 *     summary: Submit my profile for verification review
 *     description: >
 *       Requires the four core documents (government ID, proof of address, training
 *       certificate, evidence of previous projects). A CAC certificate is also
 *       required when isRegisteredBusiness is true. Sets the status to inReview.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:    { $ref: '#/components/schemas/InstallerProfile' }
 *       400:
 *         description: Required documents are missing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409:
 *         description: Already under review or verified
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
