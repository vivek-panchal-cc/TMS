import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Task } from "../entity/Task";
import { TaskDependency } from "../entity/TaskDependency";

export class TaskDependencyController {
  static async addDependency(req: Request, res: Response) {
    const { task_id, dependency_id } = req.body;

    const taskRepository = AppDataSource.getRepository(Task);
    const taskDependencyRepository =
      AppDataSource.getRepository(TaskDependency);

    try {
      const task = await taskRepository.findOne({ where: { id: task_id } });
      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      const dependency = await taskRepository.findOne({
        where: { id: dependency_id },
      });
      if (!dependency) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Dependency task not found",
        });
      }

      const taskDependency = taskDependencyRepository.create({
        task,
        dependency,
      });
      if (req.user) {
        taskDependency.created_by = req.user;
      }

      await taskDependencyRepository.save(taskDependency);

      res.status(201).json({
        status_code: 201,
        success: true,
        message: "Task dependency added successfully",
        // taskDependency,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to add task dependency",
        error: error,
      });
    }
  }

  static async updateDependency(req: Request, res: Response) {
    const { id } = req.params;
    const { dependency_id } = req.body;

    const taskDependencyRepository =
      AppDataSource.getRepository(TaskDependency);
    const taskRepository = AppDataSource.getRepository(Task);

    try {
      const taskDependency = await taskDependencyRepository.findOne({
        where: { id: id },
      });
      if (!taskDependency) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task dependency not found",
        });
      }

      const dependency = await taskRepository.findOne({
        where: { id: dependency_id },
      });

      if (!dependency) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Dependency task not found",
        });
      }

      taskDependency.dependency = dependency;
      if (req.user) {
        taskDependency.updated_by = req.user;
      }

      await taskDependencyRepository.save(taskDependency);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task dependency updated successfully",
        // taskDependency,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update task dependency",
        error: error,
      });
    }
  }

  static async listDependencies(req: Request, res: Response) {
    const { taskId } = req.params;

    const taskDependencyRepository =
      AppDataSource.getRepository(TaskDependency);

    try {
      const dependencies = await taskDependencyRepository.find({
        where: { task: { id: taskId }, is_active: true },
        relations: ["dependency"], // Assuming you want to include the full dependency object
      });

      const formattedDependencies = dependencies.map((dep) => ({
        id: dep.id,
        dependency: {
          name: dep.dependency.taskName,
          start_date: dep.dependency.start_date,
          end_date: dep.dependency.end_date,
          status: dep.dependency.status,
        },
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task dependencies retrieved successfully",
        dependencies: formattedDependencies,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch task dependencies",
        error: error,
      });
    }
  }

  static async deleteDependency(req: Request, res: Response) {
    const { id } = req.params;

    const taskDependencyRepository =
      AppDataSource.getRepository(TaskDependency);

    try {
      const taskDependency = await taskDependencyRepository.findOne({
        where: { id, is_active: true },
      });

      if (!taskDependency) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task dependency not found",
        });
      }

      taskDependency.is_active = false;
      taskDependency.deleted_at = new Date();
      if (req.user) {
        taskDependency.deleted_by = req.user;
      }

      await taskDependencyRepository.save(taskDependency);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task dependency deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete task dependency",
        error: error,
      });
    }
  }
}
