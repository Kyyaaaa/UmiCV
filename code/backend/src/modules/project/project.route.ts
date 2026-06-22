import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

import { validate } from '../../middleware/validate.middleware';
import { getProjectMembersSchema } from './project.dto';

const router = Router();
const controller = new ProjectController();

router.use(authenticate);

router.get('/', controller.getProjects.bind(controller));
router.get('/:id', controller.getProjectById.bind(controller));
router.get('/:id/members', validate(getProjectMembersSchema), controller.getProjectMembers.bind(controller));

// Chỉ Admin mới có quyền tạo/sửa/xóa Project
router.post('/', authorize([UserRole.Admin]), controller.createProject.bind(controller));
router.put('/:id', authorize([UserRole.Admin]), controller.updateProject.bind(controller));
router.delete('/:id', authorize([UserRole.Admin]), controller.deleteProject.bind(controller));

// Phân bổ nhân sự: Admin có thể add, nhưng TechLead có thể tự add vào dự án của mình không?
// Trong khuôn khổ hiện tại, allow Admin và TechLead chung (Service/Controller sẽ check riêng quyền TechLead sở hữu nếu cần, nhưng tạm thời chỉ dùng Role guard)
router.post('/:id/members', authorize([UserRole.Admin, UserRole.TechLead]), controller.assignMembers.bind(controller));
router.delete('/:id/members/:userId', authorize([UserRole.Admin, UserRole.TechLead]), controller.removeMember.bind(controller));

export default router;
