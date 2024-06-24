import { Router } from "express";
import NotificationController from "../controllers/NotificationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/index", NotificationController.getNotifications);
router.put("/:id/mark-as-read", NotificationController.markAsRead);
router.post("/mark-all-as-read", NotificationController.markAllAsRead);
router.delete("/:id/delete-notification", NotificationController.deleteNotification);
router.delete("/delete-all-notifications", NotificationController.deleteAllNotifications);

export default router;
