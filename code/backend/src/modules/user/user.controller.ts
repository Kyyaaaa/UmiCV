import { Request, Response } from 'express';
import { UserService } from './user.service';
import { MESSAGES } from '../../constants/messages';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response) {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const keyword = req.query.keyword as string;
    const role = req.query.role as any;
    const status = req.query.status as any;
    const departmentId = req.query.departmentId as string;

    const result = await userService.getUsers({ page, limit, keyword, role, status, departmentId });
    res.status(200).json({ success: true, ...result });
  }

  async getUserById(req: Request, res: Response) {
    const result = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: result });
  }

  async getMe(req: any, res: Response) {
    const userId = req.user!.userId;
    const result = await userService.getUserById(userId);
    res.status(200).json({ success: true, data: result });
  }

  async updateMe(req: any, res: Response) {
    const userId = req.user!.userId;
    const result = await userService.updateMe(userId, req.body);
    res.status(200).json({ success: true, message: 'Cập nhật thông tin cá nhân thành công', data: result });
  }

  async changeMyPassword(req: any, res: Response) {
    const userId = req.user!.userId;
    const { oldPassword, newPassword } = req.body;
    await userService.changeMyPassword(userId, oldPassword, newPassword);
    res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
  }

  async createUser(req: Request, res: Response) {
    const result = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async updateUser(req: any, res: Response) {
    const result = await userService.updateUser(req.params.id, req.body, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  }

  async lockUser(req: any, res: Response) {
    if (req.user?.userId === req.params.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể khóa tài khoản của chính mình.' });
    }
    const result = await userService.lockUser(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, message: MESSAGES.USER.LOCK_SUCCESS, data: result });
  }

  async unlockUser(req: any, res: Response) {
    const result = await userService.unlockUser(req.params.id, req.user!.userId);
    res.status(200).json({ success: true, message: MESSAGES.USER.UNLOCK_SUCCESS, data: result });
  }

  async resetPassword(req: any, res: Response) {
    await userService.resetPassword(req.params.id, req.body.newPassword, req.user!.userId);
    res.status(200).json({ success: true, message: MESSAGES.USER.RESET_PASSWORD_SUCCESS });
  }

  async changeRole(req: any, res: Response) {
    const result = await userService.changeRole(req.params.id, req.body.role, req.user!.userId);
    res.status(200).json({ success: true, message: MESSAGES.USER.CHANGE_ROLE_SUCCESS, data: result });
  }
}
