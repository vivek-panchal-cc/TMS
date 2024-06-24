import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Comment } from "../entity/Comment";
import NotificationController from "./NotificationController";
import { User } from "../entity/User";
import { Task } from "../entity/Task";
import { Project } from "../entity/Project";

class CommentController {
  static async addComment(req: Request, res: Response) {
    const { task_id, project_id, comment, taggedUserIds } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      const userRepository = AppDataSource.getRepository(User);
      const taskRepository = AppDataSource.getRepository(Task);
      const projectRepository = AppDataSource.getRepository(Project);

      const user = await userRepository.findOne({ where: { id: req.user.id } });
      const task = await taskRepository.findOne({ where: { id: task_id } });
      const project = await projectRepository.findOne({
        where: { id: project_id },
      });

      if (!user || !task || !project) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "User, Task or Project not found",
        });
      }

      const newComment = new Comment();
      newComment.user = user;
      newComment.task = task;
      newComment.project = project;
      newComment.comment = comment;
      if (req.user) {
        newComment.created_by = req.user;
      }

      if (taggedUserIds && taggedUserIds.length > 0) {
        const taggedUsers = await userRepository.findByIds(taggedUserIds);
        newComment.taggedUsers = taggedUsers;

        // Create notifications for the tagged users
        for (const user of taggedUsers) {
          await NotificationController.createNotification(
            user.id,
            "You were tagged in a comment",
            `You were tagged in a comment: "${comment}"`,
            "add-comment",
            "#00F",
            newComment.task.id,
            newComment.project.id
          );
        }
      }
      await commentRepository.save(newComment);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Comment added successfully",
        // comment: newComment,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to add comment",
        error,
      });
    }
  }

  static async editComment(req: Request, res: Response) {
    const { id } = req.params;
    const { comment, taggedUserIds } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      const userRepository = AppDataSource.getRepository(User);
      const existingComment = await commentRepository.findOne({
        where: { id },
        relations: ["taggedUsers", "task", "project", "created_by"],
      });

      if (!existingComment) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Comment not found or unauthorized",
        });
      }

      if (existingComment.created_by.id !== req.user.id) {
        return res.status(403).json({
          status_code: 403,
          success: false,
          message: "Forbidden: You are not allowed to edit this comment",
        });
      }

      existingComment.comment = comment;
      if (req.user) {
        existingComment.updated_by = req.user;
      }

      if (taggedUserIds && taggedUserIds.length > 0) {
        const taggedUsers = await userRepository.findByIds(taggedUserIds);

        if (!taggedUsers || taggedUsers.length !== taggedUserIds.length) {
          return res.status(404).json({
            status_code: 404,
            success: false,
            message: "One or more tagged users not found",
          });
        }

        existingComment.taggedUsers = taggedUsers;
        await commentRepository.save(existingComment);

        // Create notifications for the tagged users
        for (const user of taggedUsers) {
          await NotificationController.createNotification(
            user.id,
            "You were tagged in a comment",
            `You were tagged in a comment: "${comment}"`,
            "add-comment",
            "#00F",
            existingComment.task.id,
            existingComment.project.id
          );
        }
      } else {
        existingComment.taggedUsers = [];
        await commentRepository.save(existingComment);
      }

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Comment updated successfully",
        // comment: existingComment,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to edit comment",
        error,
      });
    }
  }

  static async deleteComment(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      const existingComment = await commentRepository.findOne({
        where: { id },
        relations: ["created_by"],
      });

      if (!existingComment) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Comment not found or unauthorized",
        });
      }

      if (existingComment.created_by.id !== req.user.id) {
        return res.status(403).json({
          status_code: 403,
          success: false,
          message: "Forbidden: You are not allowed to delete this comment",
        });
      }

      existingComment.is_active = false;
      existingComment.deleted_at = new Date();
      if (req.user) {
        existingComment.deleted_by = req.user;
      }

      await commentRepository.save(existingComment);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete comment",
        error,
      });
    }
  }

  static async getTaskComments(req: Request, res: Response) {
    const { taskId } = req.params;

    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      const comments = await commentRepository.find({
        select: ["id", "comment"], // Select only specific fields from Comment entity
        where: { task: { id: taskId }, is_active: true },
        relations: ["user", "taggedUsers"],
        order: { created_at: "DESC" },
      });

      const transformedComments = comments.map((comment) => ({
        id: comment.id,
        comment: comment.comment,
        // user: {
        //   id: comment.user.id,
        //   name: `${comment.user.firstName} ${comment.user.lastName}`,
        // },
        taggedUsers: comment.taggedUsers.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        })),
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Comments fetched successfully",
        comments: transformedComments,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch comments",
        error,
      });
    }
  }
}

export default CommentController;
