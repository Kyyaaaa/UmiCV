import { Router } from 'express';
import { CVController } from './cv.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getDraftSchema, upsertDraftSchema, searchSchema } from './cv.dto';

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
 * /api/cvs/draft:
 *   get:
 *     summary: Get user's CV draft
 *     tags: [CV Management]
 *     parameters:
 *       - in: query
 *         name: languageCode
 *         schema:
 *           type: string
 *           enum: [vi, en, jp]
 *           default: vi
 *     responses:
 *       200:
 *         description: CV Draft retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Draft not found
 */
router.get('/draft', authorize(['Employee']), validate(getDraftSchema), cvController.getDraft);

/**
 * @openapi
 * /api/cvs/draft:
 *   put:
 *     summary: Upsert user's CV draft
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
 *                 default: vi
 *               sectionsData:
 *                 type: object
 *     responses:
 *       200:
 *         description: CV Draft updated
 *       400:
 *         description: Bad request (cannot edit pending CV)
 */
router.put('/draft', authorize(['Employee']), validate(upsertDraftSchema), cvController.upsertDraft);

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

export default router;
