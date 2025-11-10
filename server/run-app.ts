import app from "./app";
import db from "./db";

const PORT = process.env.PORT || 3010;

db.open();
const server = app.listen(PORT, () => {
  console.log(`Express server started at port ${PORT}!`);
});

async function cleanup() {
  console.log("Express app is cleaning up");
  await db.close();
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error("Error during server close:", err);
        return reject(err);
      }
      console.log("Express app's cleanup finished");
      resolve(true);
    });
  });
  process.exit(0);
}

const sigCleanup = ["SIGINT", "SIGTERM"];

sigCleanup.forEach((sig) => process.on(sig, cleanup));
