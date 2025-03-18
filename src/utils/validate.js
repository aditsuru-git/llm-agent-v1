import fs from "fs";
import path from "path";
import { playGroundPath } from "../config/configPath.js";

const normalizedPlayGroundPath = path.resolve(playGroundPath);

function isInPlayground(targetPath) {
  if (!playGroundPath) {
    return false;
  }

  try {
    // Instead of realpathSync, just normalize the path
    const normalizedTargetPath = path.normalize(path.resolve(targetPath));
    const isValid =
      normalizedTargetPath === normalizedPlayGroundPath ||
      normalizedTargetPath.startsWith(normalizedPlayGroundPath + path.sep);

    return isValid;
  } catch (err) {
    return false;
  }
}

export { isInPlayground };
