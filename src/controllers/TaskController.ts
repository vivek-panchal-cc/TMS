import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Task } from "../entity/Task";
import { Project } from "../entity/Project";
import { Label } from "../entity/Label";
import { User } from "../entity/User";
import { Like } from "typeorm";
import { Notification } from "../entity/Notification";
import NotificationController from "./NotificationController";

export class TaskController {
  static async createTask(req: Request, res: Response) {
    const {
      taskName,
      project_id,
      label_id,
      assigned_user,
      start_date,
      end_date,
      status,
    } = req.body;
    const attachment = req.file ? req.file.path : undefined;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const projectRepository = AppDataSource.getRepository(Project);
      const labelRepository = AppDataSource.getRepository(Label);
      const userRepository = AppDataSource.getRepository(User);

      const project = await projectRepository.findOneBy({ id: project_id });
      const label = await labelRepository.findOneBy({ id: label_id });
      const assignedUser = await userRepository.findOneBy({
        id: assigned_user,
      });

      if (!project || !label || !assignedUser) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Project, Label or Assigned User not found",
        });
      }

      const task = taskRepository.create({
        taskName,
        project,
        label,
        assignedUser,
        start_date,
        end_date,
        status,
        attachment,
        assignedBy: req.user,
      });
      if (req.user) {
        task.created_by = req.user;
      }

      await taskRepository.save(task);
      // Create a notification for the assigned user
      await NotificationController.createNotification(
        assigned_user,
        "Task Added",
        `Task "${taskName}" has been added and assigned by ${req.user.firstName} ${req.user.lastName}.`,
        "add-task",
        "#55A865",
        task.id,
        project_id
      );
      await NotificationController.createNotification(
        req.user.id,
        "Task Created",
        `Task "${taskName}" has been created and assigned to ${assignedUser.firstName} ${assignedUser.lastName}.`,
        "created-task",
        "#55A865",
        task.id,
        project_id
      );
      res.status(201).json({
        status_code: 201,
        success: true,
        message: "Task created successfully",
        // task,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to create task",
        error,
      });
    }
  }

  static async getTaskById(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({
        where: { id, assignedUser: { id: req.user.id } },
        relations: ["project", "label", "assignedUser", "assignedBy"],
      });

      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      const transformedTask = {
        id: task.id,
        taskName: task.taskName,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        is_archived: task.is_archived,
        attachment: task.attachment,
        project: task.project.projectName,
        label: task.label.labelName,
        assignedUser: `${task.assignedUser.firstName} ${task.assignedUser.lastName}`,
        assignedBy: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
        is_active: task.is_active,
      };

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task fetched successfully",
        task: transformedTask,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch task",
        error,
      });
    }
  }

  static async updateTask(req: Request, res: Response) {
    const { id } = req.params;
    const {
      taskName,
      project_id,
      label_id,
      assigned_user,
      start_date,
      end_date,
      status,
    } = req.body;
    const attachment = req.file ? req.file.path : undefined;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const projectRepository = AppDataSource.getRepository(Project);
      const labelRepository = AppDataSource.getRepository(Label);
      const userRepository = AppDataSource.getRepository(User);

      const task = await taskRepository.findOne({
        where: { id, assignedUser: { id: req.user.id } },
        relations: ["project", "label", "assignedUser", "assignedBy"],
      });

      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      const project = await projectRepository.findOneBy({ id: project_id });
      const label = await labelRepository.findOneBy({ id: label_id });
      const assignedUser = await userRepository.findOneBy({
        id: assigned_user,
      });

      if (!project || !label || !assignedUser) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Project, Label or Assigned User not found",
        });
      }

      const oldStatus = task.status;
      const oldStartDate = task.start_date;
      const oldEndDate = task.end_date;
      const oldAssignedUser = task.assignedUser?.id;
      interface Notification {
        userId: string;
        title: string;
        message: string;
        type: string;
        display_color: string;
        task: string;
        project: string;
      }

      let notifications: Notification[] = [];

      task.taskName = taskName;
      task.project = project;
      task.label = label;
      task.assignedUser = assignedUser;
      task.start_date = start_date;
      task.end_date = end_date;
      task.status = status;
      if (attachment) task.attachment = attachment;

      if (req.user) {
        task.updated_by = req.user;
        task.assignedBy = req.user;
      }

      if (start_date !== oldStartDate || end_date !== oldEndDate) {
        notifications.push({
          userId: req.user.id,
          title: "Task Date Updated",
          message: `Task "${taskName}" date has been updated.`,
          type: "schedule-task",
          display_color: "#B2BEB5",
          task: task.id,
          project: task.project.id,
        });
      }

      if (assigned_user !== oldAssignedUser) {
        notifications.push({
          userId: assigned_user,
          title: "Task Assigned",
          message: `Task "${taskName}" has been assigned to ${assignedUser.firstName} ${assignedUser.lastName}.`,
          type: "assigned-task",
          display_color: "#0000FF",
          task: task.id,
          project: task.project.id,
        });
      }

      if (status !== oldStatus) {
        notifications.push({
          userId: req.user.id,
          title: "Task Status Changed",
          message: `Task "${taskName}" status has been changed to "${status}".`,
          type: "status-update",
          display_color: "#FFFF9F",
          task: task.id,
          project: task.project.id,
        });
      }

      await taskRepository.save(task);

      for (const notification of notifications) {
        await NotificationController.createNotification(
          notification.userId,
          notification.title,
          notification.message,
          notification.type,
          notification.display_color,
          notification.task,
          notification.project
        );
      }

      const responseTask = {
        id: task.id,
        taskName: task.taskName,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        is_archived: task.is_archived,
        attachment: task.attachment,
        project: project.projectName,
        label: label.labelName,
        assignedUser: `${assignedUser.firstName} ${assignedUser.lastName}`,
        assignedBy: `${req.user.firstName} ${req.user.lastName}`,
        is_active: task.is_active,
      };

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task updated successfully",
        task: responseTask,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update task",
        error,
      });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({
        where: { id, assignedUser: { id: req.user.id } },
        relations: ["project", "label", "assignedUser", "assignedBy"],
      });

      if (task) {
        task.is_active = false;
        task.updated_at = new Date();
        task.deleted_at = new Date();
        if (req.user) {
          task.deleted_by = req.user;
        }
        await taskRepository.save(task);
        res.status(200).json({
          status_code: 200,
          success: true,
          message: "Task deleted successfully",
        });
      } else {
        res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete task",
        error,
      });
    }
  }

  static async getTasksByUser(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const { taskName, start_date, end_date } = req.body;

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const queryBuilder = taskRepository.createQueryBuilder("task");

      queryBuilder
        .where("task.assignedUser.id = :userId", { userId: req.user.id })
        .leftJoinAndSelect("task.project", "project")
        .leftJoinAndSelect("task.label", "label")
        .leftJoinAndSelect("task.assignedUser", "assignedUser")
        .leftJoinAndSelect("task.assignedBy", "assignedBy")
        .orderBy("task.is_priority", "DESC")
        .addOrderBy("task.updated_at", "DESC");

      if (taskName) {
        queryBuilder.andWhere("LOWER(task.taskName) LIKE LOWER(:taskName)", {
          taskName: `%${taskName}%`,
        });
      }

      if (start_date) {
        queryBuilder.andWhere("task.start_date >= :start_date", { start_date });
      }

      if (end_date) {
        queryBuilder.andWhere("task.end_date <= :end_date", { end_date });
      }

      const tasks = await queryBuilder.getMany();

      const transformedTasks = tasks.map((task) => ({
        id: task.id,
        taskName: task.taskName,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        is_archived: task.is_archived,
        attachment: task.attachment,
        project: task.project.projectName,
        label: task.label.labelName,
        assignedUser: `${task.assignedUser.firstName} ${task.assignedUser.lastName}`,
        assignedBy: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
        is_active: task.is_active,
        is_priority: task.is_priority,
        is_favourite: task.is_favourite,
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Tasks fetched successfully",
        tasks: transformedTasks,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch tasks",
        error,
      });
    }
  }

  static async getAllTasks(req: Request, res: Response) {
    try {
      const { taskName } = req.body;
      const taskRepository = AppDataSource.getRepository(Task);
      const searchCriteria: any = { is_active: true };
      // if (req.user) {
      //   searchCriteria.created_by = req.user.id;
      // } else {
      //   return res.status(401).json({
      //     status_code: 401,
      //     success: false,
      //     message: "Unauthorized access",
      //   });
      // }

      if (taskName) {
        searchCriteria.taskName = Like(`%${taskName}%`);
      }
      const tasks = await taskRepository.find({
        where: searchCriteria,
        order: {
          is_priority: "DESC",
          updated_at: "DESC",
        },
      });

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Tasks fetched successfully",
        tasks,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch tasks",
        error,
      });
    }
  }

  static async setIsFavourite(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({ where: { id: id } });

      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      task.is_favourite = task.is_favourite === false ? true : false;
      task.updated_at = new Date();
      if (req.user) {
        task.updated_by = req.user;
      }
      await taskRepository.save(task);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task favourite status updated successfully",
        // task,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update task favourite status",
        error,
      });
    }
  }

  static async setIsPriority(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({ where: { id: id } });

      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      task.is_priority = task.is_priority === false ? true : false;
      task.updated_at = new Date();
      if (req.user) {
        task.updated_by = req.user;
      }
      await taskRepository.save(task);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Task priority status updated successfully",
        // task,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update task priority status",
        error,
      });
    }
  }
}
