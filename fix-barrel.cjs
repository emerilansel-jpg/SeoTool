const fs = require("fs");
let content = fs.readFileSync("src/db/schema.ts", "utf8");
content = content.replace("paypalWebhookEvents,,", "paypalWebhookEvents,");
fs.writeFileSync("src/db/schema.ts", content);
console.log("Fixed comma in barrel.");
