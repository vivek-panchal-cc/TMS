import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { AppDataSource } from "../config/ormconfig";
import { validate, ValidationError } from "class-validator";
import {
  loginValidation,
  registerValidation,
} from "../validators/userValidator";
import { validationMiddleware } from "../middleware/validationMiddleware";

const router = Router();

// router.post("/register", async (req: Request, res: Response) => {
//   const { email, password, firstName, lastName, age, address } = req.body;
//   const user = new User();
//   user.email = email;
//   user.password = password;
//   user.firstName = firstName;
//   user.lastName = lastName;
//   user.age = age;
//   user.address = address;

//   // Validate the User entity
//   const errors: ValidationError[] = await validate(user);
//   if (errors.length > 0) {
//     return res.status(400).send(errors);
//   }

//   const userRepository = AppDataSource.getRepository(User);
//   const existingUser = await userRepository.findOneBy({ email });

//   if (existingUser) {
//     return res.status(400).send("User already exists");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   user.password = hashedPassword;

//   await userRepository.save(user);
//   res.status(201).send("User registered successfully");
// });

router.post(
  "/register",
  registerValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, dob, address, role } =
        req.body;
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOneBy({ email });

      if (existingUser) {
        return res.status(400).json({
          status_code: 400,
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User();
      user.email = email;
      user.password = hashedPassword;
      user.firstName = firstName;
      user.lastName = lastName;
      user.dob = dob;
      user.address = address;
      user.role = role || "user";

      await userRepository.save(user);
      res.status(201).json({
        status_code: 201,
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  loginValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid credentials");
      }

      const tokenVersion = user.tokenVersion + 1;
      const token = jwt.sign(
        { id: user.id, tokenVersion },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );
      user.tokenVersion = tokenVersion;
      await userRepository.save(user);
      res.send({ token });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send("No token provided");
    }
    res.send("Logged out successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
