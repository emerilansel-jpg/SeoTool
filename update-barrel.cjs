const fs = require("fs");

let schemaStr = fs.readFileSync("src/db/schema.ts", "utf8");

const exportPattern = /(export const \{\n(?:.|\n)*?)\n\} = schema;/;

const match = schemaStr.match(exportPattern);
if (match) {
  const replacement =
    match[1] +
    ",\n  gmbGridConfigs,\n  gmbGridRuns,\n  gmbGridSnapshots\n} = schema;";
  schemaStr = schemaStr.replace(exportPattern, replacement);
  fs.writeFileSync("src/db/schema.ts", schemaStr);
  console.log("Barrel updated");
} else {
  console.log("Export pattern not found");
}
