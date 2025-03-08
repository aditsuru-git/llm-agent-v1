import path from "path";
import { playGroundPath } from "../config/configPath.js";

const normalizedPlayGroundPath = path.normalize(path.resolve(playGroundPath));

/**
 * Checks if a given path is within the playground directory
 * @param {string} targetPath - The path to check
 * @returns {boolean} - True if the path is within the playground, false otherwise
 */
function isInPlayground(targetPath) {
  const resolvedTargetPath = path.normalize(path.resolve(targetPath));
  return (
    resolvedTargetPath === normalizedPlayGroundPath ||
    resolvedTargetPath.startsWith(normalizedPlayGroundPath + path.sep)
  );
}

export { isInPlayground };
