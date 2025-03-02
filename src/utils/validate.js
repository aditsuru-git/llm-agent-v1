import path from "path";
import { playGroundPath } from "../config/configPath.js";
const normalizedPlayGroundPath = path.normalize(playGroundPath);
function isInPlayground(targetPath) {
  const resolvedTargetPath = path.resolve(targetPath);
  return (
    resolvedTargetPath === normalizedPlayGroundPath ||
    resolvedTargetPath.startsWith(normalizedPlayGroundPath + path.sep)
  );
}

export { isInPlayground };
