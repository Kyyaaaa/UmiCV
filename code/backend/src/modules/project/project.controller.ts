import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { createProjectSchema, updateProjectSchema, assignMembersSchema } from './project.dto';

const projectService = new ProjectService();

export class ProjectController {
  async getProjects(req: Request, res: Response) {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const techLeadId = req.query.techLeadId as string;
    const keyword = req.query.keyword as string;

    const data = await projectService.getProjects({ page, limit, techLeadId, keyword });
    res.status(200).json({ success: true, ...data });
  }

  async getProjectById(req: Request, res: Response) {
    const data = await projectService.getProjectById(req.params.id);
    res.status(200).json({ success: true, data });
  }

  async createProject(req: Request, res: Response) {
    const data = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(data);
    res.status(201).json({ success: true, data: project });
  }

  async updateProject(req: Request, res: Response) {
    const data = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id, data);
    res.status(200).json({ success: true, data: project });
  }

  async deleteProject(req: Request, res: Response) {
    await projectService.deleteProject(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa dự án thành công' });
  }

  async getProjectMembers(req: Request, res: Response) {
    const data = await projectService.getProjectMembers(req.params.id);
    res.status(200).json({ success: true, data });
  }

  async assignMembers(req: Request, res: Response) {
    const data = assignMembersSchema.parse(req.body);
    await projectService.assignMembers(req.params.id, data);
    res.status(200).json({ success: true, message: 'Thêm thành viên thành công' });
  }

  async removeMember(req: Request, res: Response) {
    await projectService.removeMember(req.params.id, req.params.userId);
    res.status(200).json({ success: true, message: 'Xóa thành viên thành công' });
  }
}
