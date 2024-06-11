import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Project } from "../entity/Project";
import { Like } from "typeorm";
export class ProjectController {
  static async getAllProjects(req: Request, res: Response) {
    try {
      const { projectName } = req.body;
      const projectRepository = AppDataSource.getRepository(Project);
      const searchCriteria: any = { is_active: true };
      if (req.user) {
        searchCriteria.created_by = req.user.id;
      } else {
        return res.status(401).json({
          status_code: 401,
          success: false,
          message: "Unauthorized access",
        });
      }

      if (projectName) {
        searchCriteria.projectName = Like(`%${projectName}%`);
      }
      const projects = await projectRepository.find({ where: searchCriteria });

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Projects fetched successfully",
        projects,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch projects",
        error,
      });
    }
  }

  static async createProject(req: Request, res: Response) {
    try {
      const { projectName, startDate, endDate, status } = req.body;
      const projectRepository = AppDataSource.getRepository(Project);
      const project = new Project();
      project.projectName = projectName;
      project.startDate = startDate;
      project.endDate = endDate;
      project.status = status;

      const existingProject = await projectRepository.findOneBy({
        projectName,
        is_active: true,
      });

      if (existingProject) {
        return res.status(400).json({
          status_code: 400,
          success: false,
          message: "Project already exists",
        });
      }

      if (req.user) {
        project.created_by = req.user;
      }

      await projectRepository.save(project);
      res.status(201).json({
        status_code: 201,
        success: true,
        message: "Project created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create project",
        error: error,
      });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const projectRepository = AppDataSource.getRepository(Project);
      const project = await projectRepository.findOneBy({
        id: projectId,
        is_active: true,
      });
      if (project) {
        res.status(200).json({
          status_code: 200,
          success: true,
          message: "Details fetched successfully",
          project,
        });
      } else {
        res.status(404).json({
          status_code: 404,
          success: false,
          message: "Project not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch project",
        error: error,
      });
    }
  }

  static async updateProject(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const { projectName, startDate, endDate, status } = req.body;
      const projectRepository = AppDataSource.getRepository(Project);
      const project = await projectRepository.findOneBy({ id: projectId });

      if (!project) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Project not found",
        });
      }

      project.projectName = projectName;
      project.startDate = startDate;
      project.endDate = endDate;
      project.status = status;
      project.updated_at = new Date();

      if (req.user) {
        project.updated_by = req.user;
      }

      await projectRepository.save(project);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Project updated successfully",
        project: {
          id: project.id,
          projectName: project.projectName,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          deleted_at: null,
          created_at: project.created_at,
          updated_at: project.updated_at,
          created_by: project.created_by ? project.created_by : null,
          updated_by: project.updated_by ? project.updated_by.id : null,
          is_active: project.is_active,
        },
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update project",
        error: error,
      });
    }
  }

  static async deleteProject(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const projectRepository = AppDataSource.getRepository(Project);
      const project = await projectRepository.findOneBy({ id: projectId });

      if (!project) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Project not found",
        });
      }

      //   await projectRepository.remove(project);
      project.is_active = false;
      project.updated_at = new Date();
      project.deleted_at = new Date();

      if (req.user) {
        project.deleted_by = req.user;
      }

      await projectRepository.save(project);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete project",
        error: error,
      });
    }
  }
}
