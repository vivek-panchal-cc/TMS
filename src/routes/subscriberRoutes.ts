import { Router } from "express";
import SubscriberController from "../controllers/SubscriberController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";

const router = Router();
router.use(authMiddleware);

router.post("/add", checkRole(["admin", "user"]), SubscriberController.addSubscriber);
router.get("/:taskId/get-subscribers", checkRole(["admin", "user"]), SubscriberController.getSubscribersByTaskId);
router.delete("/:id/remove-subscriber", checkRole(["admin", "user"]), SubscriberController.removeSubscriber);

export default router;
