import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response) {
    const result = await userService.getUsers(req.query as any);
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

  async lockUser(req: Request, res: Response) {
    const result = await userService.lockUser(req.params.id);
    res.status(200).json({ success: true, message: 'User locked successfully', data: result });
  }

  async unlockUser(req: Request, res: Response) {
    const result = await userService.unlockUser(req.params.id);
    res.status(200).json({ success: true, message: 'User unlocked successfully', data: result });
  }

  async resetPassword(req: Request, res: Response) {
    await userService.resetPassword(req.params.id, req.body.newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  }

  async changeRole(req: Request, res: Response) {
    const result = await userService.changeRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: 'Role changed successfully', data: result });
  }
}
