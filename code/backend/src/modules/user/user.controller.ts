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

  async createUser(req: Request, res: Response) {
    const result = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async updateUser(req: Request, res: Response) {
    const result = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  }

  async lockUser(req: any, res: Response) {
    if (req.user?.userId === req.params.id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể khóa tài khoản của chính mình.' });
    }
    const result = await userService.lockUser(req.params.id);
    res.status(200).json({ success: true, message: MESSAGES.USER.LOCK_SUCCESS, data: result });
  }

  async unlockUser(req: Request, res: Response) {
    const result = await userService.unlockUser(req.params.id);
    res.status(200).json({ success: true, message: MESSAGES.USER.UNLOCK_SUCCESS, data: result });
  }

  async resetPassword(req: Request, res: Response) {
    await userService.resetPassword(req.params.id, req.body.newPassword);
    res.status(200).json({ success: true, message: MESSAGES.USER.RESET_PASSWORD_SUCCESS });
  }

  async changeRole(req: Request, res: Response) {
    const result = await userService.changeRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: MESSAGES.USER.CHANGE_ROLE_SUCCESS, data: result });
  }
}
