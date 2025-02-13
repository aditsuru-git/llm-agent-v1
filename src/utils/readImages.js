import path from "path";
import fs from "fs";
import { isInPlayground } from "./validate.js";

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
    if (!filePath.length) return "Provide image paths in proper format!";

    const fileParts = [];
    filePath.forEach((file) => {
      if (!fs.existsSync(file)) fileParts.push("File path doesn't exist");
      if (!isInPlayground(file)) fileParts.push("File is outside playground");
      else {
        fileParts.push(fileToGenerativePart(file));
      }
    });
    return fileParts;
  } catch (err) {
    return `Couldn't perform operation: ${err}`;
  }
}

export { readImages };
