import { Router } from 'express';
import { CVController } from './cv.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getCVByIdSchema, updateDraftSchema, searchSchema, createCVSchema, cvVersionParamsSchema, publishCVSchema, copyLocalizationSchema } from './cv.dto';

const router = Router();
const cvController = new CVController();

/**
 * @openapi
 * tags:
 *   name: CV Management
 *   description: CV related operations
 */

// Use authentication for all CV routes
router.use(authenticate);

/**
 * @openapi
 * /api/cvs/me:
 *   get:
 *     summary: Get list of current user's CVs
 *     tags: [CV Management]
 *     responses:
 *       200:
 *         description: List of CVs retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authorize(['Employee']), cvController.getMyCVs);

/**
 * @openapi
 * /api/cvs:
 *   post:
 *     summary: Create a new CV draft
 *     tags: [CV Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               languageCode:
 *                 type: string
 *                 enum: [vi, en, jp]
 *     responses:
 *       201:
 *         description: CV Created
 *       400:
 *         description: Bad request
 */
router.post('/', authorize(['Employee']), validate(createCVSchema), cvController.createCV);

/**
 * @openapi
 * /api/cvs/{id}:
 *   get:
 *     summary: Get CV details by ID
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', authorize(['Employee']), validate(getCVByIdSchema), cvController.getCVById);

/**
 * @openapi
 * /api/cvs/{id}/draft:
 *   put:
 *     summary: Update CV draft (Auto-save)
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionsData:
 *                 type: object
 *     responses:
 *       200:
 *         description: CV Draft updated
 *       400:
 *         description: Bad request
 */
router.put('/:id/draft', authorize(['Employee']), validate(updateDraftSchema), cvController.updateDraftById);

/**
 * @openapi
 * /api/cvs/{id}/publish:
 *   post:
 *     summary: Publish a CV draft for approval
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV submitted for approval
 *       400:
 *         description: Bad request (No changes to publish)
 */
router.post('/:id/publish', authorize(['Employee']), validate(publishCVSchema), cvController.publish);

/**
 * @openapi
 * /api/cvs/search:
 *   get:
 *     summary: Search CVs
 *     tags: [CV Management]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A list of CVs
 */
router.get('/search', authorize(['TechLead', 'HR', 'Admin']), validate(searchSchema), cvController.search);

/**
 * @openapi
 * /api/cvs/{id}/diff:
 *   get:
 *     summary: Get CV diff between original and draft
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Diff data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: CV not found
 */
router.get('/:id/diff', cvController.diff);

/**
 * @openapi
 * /api/cvs/{id}/versions:
 *   get:
 *     summary: Get CV version history
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of versions retrieved
 */
router.get('/:id/versions', authorize(['Employee']), validate(getCVByIdSchema), cvController.getCVVersions);

/**
 * @openapi
 * /api/cvs/{id}/versions/{versionId}:
 *   get:
 *     summary: Get specific CV version details
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Version details retrieved
 */
router.get('/:id/versions/:versionId', authorize(['Employee']), validate(cvVersionParamsSchema), cvController.getCVVersionById);

/**
 * @openapi
 * /api/cvs/{id}/versions/{versionId}/restore:
 *   post:
 *     summary: Restore a CV draft from a version snapshot
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CV version restored
 *       400:
 *         description: Cannot edit pending CV
 */
router.post('/:id/versions/:versionId/restore', authorize(['Employee']), validate(cvVersionParamsSchema), cvController.restoreCVVersion);

/**
 * @openapi
 * /api/cvs/{id}/localizations/copy:
 *   post:
 *     summary: Copy CV sectionsData to another language draft
 *     tags: [CV Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetLanguageCode:
 *                 type: string
 *                 enum: [vi, en, jp]
 *     responses:
 *       200:
 *         description: CV draft copied successfully
 *       400:
 *         description: Cannot overwrite pending CV
 */
router.post('/:id/localizations/copy', authorize(['Employee']), validate(copyLocalizationSchema), cvController.copyLocalization);

export default router;
