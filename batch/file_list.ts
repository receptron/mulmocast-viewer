import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, "..");
const files = fs.globSync(path.resolve(baseDir, "public/*/mulmo_view.json"));
console.log(files, baseDir)

const fileNames = files.map(file => {
  return file.split("/").at(-2);
})
const data = {
  files: fileNames,
}

fs.writeFileSync(path.resolve(baseDir, "src/views/data.ts"), "export const data = " + JSON.stringify(data, null, 2) + ";", "utf8");
console.log(fileNames);
