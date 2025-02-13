import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PLAYGROUND_PATH = path.resolve(__dirname, "..", "..", "playground");

function isInPlayground(targetPath) {
  const resolvedTargetPath = path.resolve(targetPath);
  return (
    resolvedTargetPath === PLAYGROUND_PATH ||
    resolvedTargetPath.startsWith(PLAYGROUND_PATH + path.sep)
  );
}

export { isInPlayground };
