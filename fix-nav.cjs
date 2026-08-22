const fs = require("fs");
let content = fs.readFileSync("src/client/navigation/items.ts", "utf8");

content = content.replace(
  /\/(_dashboard\/)?projects\/\$projectId\/gmb-grid/g,
  "/p/$projectId/gmb-grid",
);

fs.writeFileSync("src/client/navigation/items.ts", content);
console.log("Nav paths fixed.");
