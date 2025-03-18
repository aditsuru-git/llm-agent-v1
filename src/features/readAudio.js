import path from "path";
import fs from "fs";
import { isInPlayground } from "../utils/validate.js";

function fileToGenerativePart(filePath) {
  const base64Buffer = fs.readFileSync(filePath);
  const base64AudioFile = base64Buffer.toString("base64");
  const mimeType =
    "audio/" + path.extname(filePath).toLowerCase().trim().slice(1);

  return {
    inlineData: {
      mimeType: mimeType,
      data: base64AudioFile,
    },
  };
}

function readAudio(file, prompt) {
  try {
    file = path.resolve(file);

    if (!fs.existsSync(file)) return "System: File path doesn't exist";
    if (!isInPlayground(file)) return "System: File out of reach";

    const fileParts = [fileToGenerativePart(file), { text: prompt }];

    return fileParts;
  } catch (err) {
    return `System: Couldn't perform operation: ${err.message}`; // More precise error
  }
}

export { readAudio };
