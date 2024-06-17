import { Router } from "express";
import NotificationController from "../controllers/NotificationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/notifications", NotificationController.getNotifications);
router.put('/notifications/:id/mark-as-read', NotificationController.markAsRead);
router.delete('/notifications/:id/delete-notification', NotificationController.deleteNotification);

export default router;
