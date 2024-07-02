import express from 'express';
import { TaskDependencyController } from '../controllers/TaskDependencyController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationMiddleware } from '../middleware/validationMiddleware';
import { taskDependencyValidation } from '../validators/userValidator';

const router = express.Router();
router.use(authMiddleware);

router.post("/add", taskDependencyValidation, validationMiddleware, TaskDependencyController.addDependency);
router.put("/:id/update-dependencies", taskDependencyValidation, validationMiddleware, TaskDependencyController.updateDependency);
router.get("/:taskId/list", TaskDependencyController.listDependencies);
router.delete("/:id/delete", TaskDependencyController.deleteDependency);

export default router;
