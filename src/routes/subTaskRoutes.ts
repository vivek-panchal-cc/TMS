import express from "express";
import { SubTaskController } from "../controllers/SubTaskController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { subTaskValidation } from "../validators/userValidator";

const router = express.Router();
router.use(authMiddleware);

router.post("/add", subTaskValidation, validationMiddleware, SubTaskController.addSubtask);
router.put("/:id/update-subtask", subTaskValidation, validationMiddleware, SubTaskController.updateSubtask);
router.get("/:taskId/list", SubTaskController.listSubtasks);
router.delete("/:id/delete", SubTaskController.deleteSubtask);

export default router;
