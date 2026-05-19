const db = require("../src/db");

db.initDb()
  .then(async () => {
    console.log("Database initialized.");
    await db.closeDb();
  })
  .catch(async (error) => {
    console.error(error);
    await db.closeDb();
    process.exit(1);
  });

