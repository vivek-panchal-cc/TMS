import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/ormconfig";
import user from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
import router from "./routes"

dotenv.config();
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

app.use("/api", router);
app.use("/api/users", user);
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
