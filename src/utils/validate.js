import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function isInPlayground(absolutePath) {
  try {
    const PLAYGROUND_PATH = fs.realpathSync(
      path.join(__dirname, "..", "..", "playground")
    );
    const realPath = fs.realpathSync(absolutePath);
    return (
      realPath === PLAYGROUND_PATH ||
      realPath.startsWith(PLAYGROUND_PATH + path.sep)
    );
  } catch (error) {
    return false;
  }
}

export { isInPlayground };
