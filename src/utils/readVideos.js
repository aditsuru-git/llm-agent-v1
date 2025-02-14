import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import path from "path";
import dotenv from "dotenv";
import { isInPlayground } from "./validate.js";
import fs from "fs";
dotenv.config();

const fileManager = new GoogleAIFileManager(process.env.API_KEY);

async function readVideo(filePath, fileName = Math.random(), prompt) {
  try {
    if (!fs.existsSync(filePath)) return "File path doesn't exist";
    if (!isInPlayground(filePath)) return "File out of reach";
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "video/" + path.extname(filePath).toLowerCase().trim().slice(1),
      displayName: fileName,
    });

    const name = uploadResponse.file.name;

    let file = await fileManager.getFile(name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Video processing failed.");
    }

    const result = [
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

    return result;
  } catch (err) {
    return "System: Error: " + err;
  }
}

export { readVideo };
