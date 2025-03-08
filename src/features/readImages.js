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
    if (!filePath.length)
      return "System: Provide image paths in proper format!";

    const fileParts = [];
    filePath.forEach((file) => {
      if (!fs.existsSync(file)) return "System: File path doesn't exist";
      if (!isInPlayground(file)) return "System: File out of reach";
      else {
        fileParts.push(fileToGenerativePart(file));
      }
    });
    return fileParts;
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

export { readImages };
