import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";

class NotificationController {
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    display_color: string
  ) {
    const notificationRepository = AppDataSource.getRepository(Notification);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const notification = new Notification();
    notification.user = user;
    notification.title = title;
    notification.message = message;
    notification.type = type;
    notification.display_color = display_color;

    await notificationRepository.save(notification);
  }

  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status_code: 401,
          success: false,
          message: "Unauthorized",
        });
      }

      const notificationRepository = AppDataSource.getRepository(Notification);
      const notifications = await notificationRepository.find({
        where: { user: { id: userId } },
        order: { created_at: "DESC" },
      });

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Notifications fetched successfully",
        notifications,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch notifications",
        error,
      });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const notification = await notificationRepository.findOne({
        where: {
          id,
          user: { id: req.user.id }, // Correctly reference the user relation
        },
      });

      if (!notification) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Notification not found",
        });
      }

      if (notification.is_read) {
        return res.status(200).json({
          status_code: 200,
          success: true,
          message: "Notification already read",
        });
      }

      notification.is_read = true;

      if (req.user) {
        notification.updated_by = req.user;
      }

      await notificationRepository.save(notification);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Notification marked as read",
        // notification,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to mark notification as read",
        error,
      });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        status_code: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const notification = await notificationRepository.findOne({
        where: {
          id,
          user: { id: req.user.id },
        },
      });

      if (!notification) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Notification not found",
        });
      }

      notification.is_active = false;
      notification.deleted_at = new Date();
      if (req.user) {
        notification.deleted_by = req.user;
      }

      await notificationRepository.save(notification);

      return res.status(200).json({
        status_code: 200,
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      return res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete notification",
        error,
      });
    }
  }
}

export default NotificationController;
