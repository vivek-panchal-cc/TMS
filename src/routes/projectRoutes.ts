import express from "express";
import { ProjectController } from "../controllers/ProjectController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { projectValidation } from "../validators/userValidator";

const router = express.Router();

router.use(authMiddleware);

router.post("/index", ProjectController.getAllProjects);
router.post("/add", projectValidation, validationMiddleware, checkRole(["admin", "user"]), ProjectController.createProject);
router.get("/details/:id", ProjectController.getProjectById);
router.put("/update/:id", projectValidation, validationMiddleware, checkRole(["admin", "user"]), ProjectController.updateProject);
router.delete("/delete/:id", checkRole(["admin", "user"]), ProjectController.deleteProject);

export default router;
