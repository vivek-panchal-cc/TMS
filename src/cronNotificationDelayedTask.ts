import * as cron from "node-cron";
import { createConnection, LessThan, Not } from "typeorm";
import NotificationController from "./controllers/NotificationController";
import { Task } from "./entity/Task";

async function main() {
  // Establish database connection
  const connection = await createConnection();
  const taskRepository = connection.getRepository(Task);

  // Define the cron job schedule (every minute in this example)
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        // Query for tasks that are delayed and not completed
        const delayedTasks = await taskRepository.find({
          where: {
            end_date: LessThan(new Date()), // Adjust according to TypeORM syntax
            status: Not("completed"),
          },
          relations: ["assignedUser", "project"], // Assuming 'assignedUser' is a relation in Task entity
        });

        // Process each delayed task and send notifications
        for (const task of delayedTasks) {
          await NotificationController.createNotification(
            task.assignedUser.id, // Notify the assigned user
            "Task Delayed",
            `Task "${task.taskName}" has been delayed.`,
            "delay-task",
            "#F00",
            task.id,
            task.project.id
          );
        }

        console.log("Cron job executed successfully.");
      } catch (error) {
        console.error("Error executing cron job:", error);
      }
    },
    {
      scheduled: true,
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Calcutta", // Adjust timezone as per your requirements
    }
  );

  console.log("Cron job scheduled.");
}

main().catch((error) => console.error("Failed to start cron job:", error));
