import express from "express";
import { LabelController } from "../controllers/LabelController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { labelValidation } from "../validators/userValidator";

const router = express.Router();

router.use(authMiddleware);

router.post("/index", checkRole(["admin"]), LabelController.getAllLabels);
router.post("/add", labelValidation, validationMiddleware, checkRole(["admin"]), LabelController.createLabel);
router.get("/details/:id", checkRole(["admin"]), LabelController.getLabelById);
router.put("/update/:id", labelValidation, validationMiddleware, checkRole(["admin"]), LabelController.updateLabel);
router.delete("/delete/:id", checkRole(["admin"]), LabelController.deleteLabel);

export default router;
