import path from "path";
import fs from "fs";
import { isInPlayground } from "../utils/validate.js";

function fileToGenerativePart(filePath) {
  const mimeType =
    "image/" + path.extname(filePath).toLowerCase().trim().slice(1);
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}

function readImages(filePath) {
  try {
    // Ensure filePath is an array
    if (!Array.isArray(filePath)) filePath = [filePath];

    if (!filePath.length)
      return "System: Provide image paths in proper format!";

    const fileParts = [];

    for (const file of filePath) {
      if (!fs.existsSync(file)) return "System: File path doesn't exist";
      if (!isInPlayground(file)) return "System: File out of reach";

      fileParts.push(fileToGenerativePart(file));
    }

    return fileParts;
  } catch (err) {
    return `System: Couldn't perform operation: ${err.message}`;
  }
}

export { readImages };
