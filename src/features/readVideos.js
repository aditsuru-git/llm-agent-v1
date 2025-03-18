import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import path from "path";
import dotenv from "dotenv";
import { isInPlayground } from "../utils/validate.js";
import fs from "fs";

dotenv.config();

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

async function readVideo(filePath, fileName = Math.random(), prompt) {
  try {
    if (!fs.existsSync(filePath)) return "System: File path doesn't exist";
    if (!isInPlayground(filePath)) return "System: File out of reach";

    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "video/" + path.extname(filePath).toLowerCase().trim().slice(1),
      displayName: fileName,
    });

    const name = uploadResponse.file.name;
    let file = await fileManager.getFile(name);

    // Wait for the file to finish processing
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Reduced wait time
      file = await fileManager.getFile(name);
    }

    // Handle processing failure
    if (file.state === FileState.FAILED) {
      return "System: Video processing failed.";
    }

    return [
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: prompt,
      },
    ];
  } catch (err) {
    return "System: Error: " + err.message; // More precise error message
  }
}

export { readVideo };
