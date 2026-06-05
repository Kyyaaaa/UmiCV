import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  queryUsersSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  resetPasswordSchema,
  changeRoleSchema,
} from './user.dto';

const router = Router();
const userController = new UserController();

/**
 * @openapi
 * tags:
 *   name: User Management
 *   description: Administrator user management operations
 */

// All endpoints require authentication and Admin role
router.use(authenticate);
router.use(authorize(['Admin']));

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get a list of users
 *     tags: [User Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Employee, HR, TechLead, Admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Locked]
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/', validate(queryUsersSchema), userController.getUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - fullName
 *               - password
 *               - role
 *               - departmentId
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Employee, HR, TechLead, Admin]
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input or duplicate username/email
 */
router.post('/', validate(createUserSchema), userController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', validate(userIdParamSchema), userController.getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [User Management]
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
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Employee, HR, TechLead, Admin]
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [Active, Locked]
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/:id', validate(updateUserSchema), userController.updateUser);

/**
 * @openapi
 * /api/users/{id}/lock:
 *   patch:
 *     summary: Lock a user account
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User locked successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/lock', validate(userIdParamSchema), userController.lockUser);

/**
 * @openapi
 * /api/users/{id}/unlock:
 *   patch:
 *     summary: Unlock a user account
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User unlocked successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/unlock', validate(userIdParamSchema), userController.unlockUser);

/**
 * @openapi
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [User Management]
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
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', validate(resetPasswordSchema), userController.resetPassword);

/**
 * @openapi
 * /api/users/{id}/role:
 *   patch:
 *     summary: Change user role
 *     tags: [User Management]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Employee, HR, TechLead, Admin]
 *     responses:
 *       200:
 *         description: Role changed successfully
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', validate(changeRoleSchema), userController.changeRole);

export default router;
