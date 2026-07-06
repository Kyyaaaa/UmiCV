import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new DepartmentController();

// Áp dụng middleware authentication cho tất cả các route của department
router.use(authenticate);

router.get('/', controller.getDepartments.bind(controller));
router.get('/tree', controller.getDepartmentTree.bind(controller));
router.get('/:id', controller.getDepartmentById.bind(controller));

// Chỉ Admin mới có quyền sửa đổi phòng ban
router.post('/', authorize([UserRole.Admin]), controller.createDepartment.bind(controller));
router.put('/:id', authorize([UserRole.Admin]), controller.updateDepartment.bind(controller));
router.delete('/:id', authorize([UserRole.Admin]), controller.deleteDepartment.bind(controller));

export default router;
