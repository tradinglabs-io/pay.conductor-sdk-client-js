import { rmSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagesDir = join(__dirname, "..", "packages");

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log("Cleaning src folders from packages...\n");

for (const pkg of packages) {
  const srcPath = join(packagesDir, pkg, "src");
  if (existsSync(srcPath)) {
    rmSync(srcPath, { recursive: true, force: true });
    console.log(`  ✓ Removed packages/${pkg}/src`);
  }
}

console.log("\nAll src folders cleaned!\n");
