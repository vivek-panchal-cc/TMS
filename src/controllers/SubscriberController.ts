import { Request, Response } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../config/ormconfig";
import { Subscriber } from "../entity/Subscriber";
import { Task } from "../entity/Task";
import { User } from "../entity/User";
import { sendEmail } from "../utils/email";
import NotificationController from "./NotificationController";

class SubscriberController {
  static async addSubscriber(req: Request, res: Response) {
    const { taskId, userIds } = req.body;

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const userRepository = AppDataSource.getRepository(User);
      const subscriberRepository = AppDataSource.getRepository(Subscriber);

      const task = await taskRepository.findOne({
        where: { id: taskId },
        relations: ["project"],
      });

      if (!task) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Task not found",
        });
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          status_code: 400,
          success: false,
          message: "User IDs must be a non-empty array",
        });
      }

      const users = await userRepository.findBy({
        id: In(userIds),
      });

      if (users.length !== userIds.length) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "One or more users not found",
        });
      }

      // Find existing subscribers for the task
      const existingSubscribers = await subscriberRepository.find({
        where: {
          task: { id: taskId },
          user: In(userIds),
        },
      });

      // Filter out users who are already subscribed
      const newUsers = users.filter(
        (user) => !existingSubscribers.some((sub) => sub.user.id === user.id)
      );

      if (newUsers.length === 0) {
        return res.status(400).json({
          status_code: 400,
          success: false,
          message: "All provided users are already subscribed to the task",
        });
      }

      const subscribers = newUsers.map((user) => {
        const subscriber = new Subscriber();
        subscriber.task = task;
        subscriber.user = user;
        if (req.user) {
          subscriber.created_by = req.user;
        }
        return subscriber;
      });

      await subscriberRepository.save(subscribers);

      // Send email notifications to new subscribers
      const projectName = task.project?.projectName;
      const taskName = task.taskName;
      for (const user of newUsers) {
        const email = user.email;
        const name = `${user.firstName} ${user.lastName}`;
        const subject = "You've been subscribed to a task!";
        const message = `Hi ${name},\n\nYou have been subscribed to the task: ${taskName}.\n\nBest regards,\nYour Project Team`;

        try {
          await sendEmail(projectName, email, subject, message);
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
        }

        // Send notifications to new subscribers
        try {
          await NotificationController.createNotification(
            user.id,
            "Task Subscription",
            `You have been subscribed to the task: ${taskName}`,
            "task-subscribe",
            "#0FF",
            taskId,
            task.project.id
          );
        } catch (error) {
          console.error(
            `Failed to create notification for user ${user.id}:`,
            error
          );
        }
      }

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subscribers added successfully",
        // subscribers,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to add subscribers",
        error,
      });
    }
  }

  static async getSubscribersByTaskId(req: Request, res: Response) {
    const { taskId } = req.params;

    try {
      const subscriberRepository = AppDataSource.getRepository(Subscriber);
      const subscribers = await subscriberRepository.find({
        where: { task: { id: taskId }, is_active: true },
        relations: ["user"],
      });

      const transformedSubscribers = subscribers.map((subscriber) => ({
        id: subscriber.id,
        user: {
          id: subscriber.user.id,
          name: `${subscriber.user.firstName} ${subscriber.user.lastName}`,
        },
      }));

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subscribers fetched successfully",
        subscribers: transformedSubscribers,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch subscribers",
        error,
      });
    }
  }

  static async removeSubscriber(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const subscriberRepository = AppDataSource.getRepository(Subscriber);
      const subscriber = await subscriberRepository.findOne({
        where: { id: id },
      });

      if (!subscriber) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Subscriber not found",
        });
      }

      await subscriberRepository.remove(subscriber);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Subscriber removed successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to remove subscriber",
        error,
      });
    }
  }
}

export default SubscriberController;
