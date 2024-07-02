import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Task } from "../entity/Task";
import { Subtask } from "../entity/SubTask";

export class SubTaskController {
  static async addSubtask(req: Request, res: Response) {
    const { task_id, name, description, status } = req.body;

    const taskRepository = AppDataSource.getRepository(Task);
    const subtaskRepository = AppDataSource.getRepository(Subtask);

    try {
      const task = await taskRepository.findOne({ where: { id: task_id } });
      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      const subtask = subtaskRepository.create({
        name,
        description: description,
        status: status,
        task,
      });
      if (req.user) {
        subtask.created_by = req.user;
      }

      await subtaskRepository.save(subtask);

      res.status(201).json({
        status_code: 201,
        success: true,
        message: "Subtask added successfully",
        // subtask,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to add subtask",
        error: error,
      });
    }
  }

  static async updateSubtask(req: Request, res: Response) {
    const { id } = req.params;
    const subtaskData = req.body;

    const subtaskRepository = AppDataSource.getRepository(Subtask);

    try {
      const subtask = await subtaskRepository.findOne({
        where: { id: id },
      });
      if (!subtask) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Subtask not found",
        });
      }

      Object.assign(subtask, subtaskData);
      if (req.user) {
        subtask.updated_by = req.user;
      }

      await subtaskRepository.save(subtask);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subtask updated successfully",
        // subtask,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update subtask",
        error: error,
      });
    }
  }

  static async listSubtasks(req: Request, res: Response) {
    const { taskId } = req.params;

    const subtaskRepository = AppDataSource.getRepository(Subtask);

    try {
      const subtasks = await subtaskRepository.find({
        where: { task: { id: taskId }, is_active: true },
      });

      const formattedSubtasks = subtasks.map((subtask) => ({
        id: subtask.id,
        name: subtask.name,
        description: subtask.description,
        status: subtask.status,
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subtasks retrieved successfully",
        subtasks: formattedSubtasks,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch subtasks",
        error: error,
      });
    }
  }

  static async deleteSubtask(req: Request, res: Response) {
    const { id } = req.params;

    const subtaskRepository = AppDataSource.getRepository(Subtask);

    try {
      const subtask = await subtaskRepository.findOne({
        where: { id, is_active: true },
      });

      if (!subtask) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Subtask not found",
        });
      }

      subtask.is_active = false;
      subtask.deleted_at = new Date();
      if (req.user) {
        subtask.deleted_by = req.user;
      }

      await subtaskRepository.save(subtask);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subtask deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete subtask",
        error: error,
      });
    }
  }
}
