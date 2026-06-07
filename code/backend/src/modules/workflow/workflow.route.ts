import { Router } from 'express';
import { WorkflowController } from './workflow.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { approveSchema, rejectSchema, submitDraftSchema } from './workflow.dto';

const router = Router();
const workflowController = new WorkflowController();

/**
 * @openapi
 * tags:
 *   name: Workflow
 *   description: CV approval workflow operations
 */

// Use authentication
router.use(authenticate);

/**
 * @openapi
 * /api/cvs/draft/submit:
 *   post:
 *     summary: Submit CV draft for approval
 *     tags: [Workflow]
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
 *     responses:
 *       200:
 *         description: CV submitted successfully
 *       400:
 *         description: Invalid state for submission
 */
router.post('/draft/submit', authorize(['Employee']), validate(submitDraftSchema), workflowController.submitDraft);

/**
 * @openapi
 * /api/cvs/{id}/approve:
 *   post:
 *     summary: Approve a CV
 *     tags: [Workflow]
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
 *             required:
 *               - level
 *             properties:
 *               level:
 *                 type: integer
 *                 enum: [1, 2]
 *     responses:
 *       200:
 *         description: CV approved successfully
 *       403:
 *         description: Forbidden (Not assigned to this CV)
 *       404:
 *         description: CV not found
 */
router.post('/:id/approve', authorize(['TechLead', 'HR', 'Admin']), validate(approveSchema), workflowController.approveCV);

/**
 * @openapi
 * /api/cvs/{id}/reject:
 *   post:
 *     summary: Reject a CV
 *     tags: [Workflow]
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               sectionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: CV rejected successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: CV not found
 */
router.post('/:id/reject', authorize(['TechLead', 'HR', 'Admin']), validate(rejectSchema), workflowController.rejectCV);

/**
 * @openapi
 * /api/cvs/{id}/approval-logs:
 *   get:
 *     summary: Get approval logs for a CV
 *     tags: [Workflow]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of approval logs
 *       404:
 *         description: CV not found
 */
router.get('/:id/approval-logs', authorize(['Employee', 'TechLead', 'HR', 'Admin']), workflowController.getApprovalLogs);

export default router;
