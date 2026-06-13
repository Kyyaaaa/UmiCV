import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getNotificationsSchema, broadcastNotificationSchema } from './notification.dto';

const router = Router();
const notificationController = new NotificationController();

/**
 * @openapi
 * tags:
 *   name: Notification
 *   description: In-App Notifications
 */

router.use(authenticate);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the current user
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', validate(getNotificationsSchema), notificationController.getAll);

/**
 * @openapi
 * /api/notifications/broadcast:
 *   post:
 *     summary: Broadcast a global notification
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Global notification created
 *       403:
 *         description: Forbidden
 */
router.post('/broadcast', authorize(['Admin', 'HR']), validate(broadcastNotificationSchema), notificationController.broadcast);

export default router;
