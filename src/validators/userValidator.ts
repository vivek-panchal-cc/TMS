// validators/userValidator.ts
import { body } from "express-validator";

export const registerValidation = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  // body('age').isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body("dob")
    .matches(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)
    .withMessage("Date of birth must be in the format dd/mm/yyyy"),
  body("address").notEmpty().withMessage("Address is required"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const projectValidation = [
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("status").notEmpty().withMessage("Status is required"),
];

export const labelValidation = [
  body("labelName").notEmpty().withMessage("Label name is required"),
  body("color")
    .notEmpty()
    .withMessage("Color is required")
    // .matches(/^#([0-9A-F]{3}){1,2}$/i)
    .matches(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i)
    .withMessage("Color must be a valid hex code"),
];

export const taskValidation = [
  body("task_name").notEmpty().withMessage("Task name is required"),
  body("project_id").notEmpty().withMessage("Project ID is required"),
  body("label_id").notEmpty().withMessage("Label ID is required"),
  body("assigned_user").notEmpty().withMessage("Assigned user is required"),
  body("start_date")
    .isDate()
    .withMessage("Start date is required and must be a valid date"),
  body("end_date")
    .isDate()
    .withMessage("End date is required and must be a valid date"),
  body("status").notEmpty().withMessage("Status is required"),
  body('attachment').optional().isString().withMessage('Attachment must be a string'),
];
