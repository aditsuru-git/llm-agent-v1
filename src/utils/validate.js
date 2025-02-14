import path from "path";
import { playGroundPath } from "../config/configPath.js";

function isInPlayground(targetPath) {
  const resolvedTargetPath = path.resolve(targetPath);
  return (
    resolvedTargetPath === playGroundPath ||
    resolvedTargetPath.startsWith(playGroundPath + path.sep)
  );
}

export { isInPlayground };
