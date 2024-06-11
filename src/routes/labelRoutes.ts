import express from "express";
import { LabelController } from "../controllers/LabelController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkRole } from "../middleware/roleMiddleware";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { labelValidation } from "../validators/userValidator";

const router = express.Router();

router.use(authMiddleware);

router.post("/index", LabelController.getAllLabels);
router.post("/add", labelValidation, validationMiddleware, LabelController.createLabel);
router.get("/details/:id", LabelController.getLabelById);
router.put("/update/:id", labelValidation, validationMiddleware, LabelController.updateLabel);
router.delete("/delete/:id", LabelController.deleteLabel);

export default router;
