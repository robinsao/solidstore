import app from "./app";
import db from "./db";

const PORT = process.env.PORT || 3010;

db.open();
const server = app.listen(PORT, () => {
  console.log(`Express server started at port ${PORT}!`);
});

function cleanup() {
  db.close();
  server.close(() => {
    console.log("Express app's cleanup finished");
  });
}

const sigCleanup = ["SIGINT", "SIGTERM", "SIGKILL"];

sigCleanup.forEach((sig) => process.on(sig, cleanup));
