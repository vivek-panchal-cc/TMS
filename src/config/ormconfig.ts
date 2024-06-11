import { DataSource } from "typeorm";
import { User } from "../entity/User";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "user",
  entities: ["src/entity/**/*.ts"],
  synchronize: true,
  logging: false,
  migrations: [],
  subscribers: [],
});
