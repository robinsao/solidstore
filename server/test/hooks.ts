import db from "../db";
import app from "../app";

let server;
export const mochaHooks = {
  beforeAll: async function () {
    await db.open();
    server = app.listen(process.env.PORT, () => {});
  },
  afterAll: async function () {
    console.log("Closing");
    await db.close();
    await server.close();
  },
};
