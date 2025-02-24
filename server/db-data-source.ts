import { DataSource } from "typeorm";
import { File } from "./entities/file";

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = +process.env.DB_PORT;
const database = process.env.DB_DATABASE;

export const dataSource = new DataSource({
  type: "postgres",
  username,
  password,
  host,
  port,
  database,
  entities: [File],
  migrations: ["./migrations/**/*.ts"],
});
