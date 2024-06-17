import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/ormconfig";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import labelRoutes from "./routes/labelRoutes";
import taskRoutes from "./routes/taskRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import user from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/users", user);
app.use("/api/projects", projectRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/tasks", taskRoutes)
app.use("/api", notificationRoutes)

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
