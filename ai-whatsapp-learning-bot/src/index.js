const db = require("./db");
const { setupScheduler } = require("./scheduler");

async function main() {
  await db.initDb();
  setupScheduler();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

