import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { systemInstructions } from "../config/systemInstructions.js";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import schema from "../config/schema.js";
import {
  readDir,
  renameFile,
  deleteFile,
  createFile,
  createDir,
  deleteFolder,
} from "./fileOperations.js";
import { readImages } from "./readImages.js";
import { takeWebScreenshot } from "./webScraper.js";
import { readAudio } from "./readAudio.js";
import { readVideo } from "./readVideos.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Initialize model and chat
const persona = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "config", "persona.json"), "utf8")
);

const finalSystemInstruction = `Your personality:\n${persona.persona}\n${systemInstructions}\n`;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: finalSystemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

let chat = model.startChat({
  history: [],
});

// Reset chat if needed
function resetChat() {
  chat = model.startChat({
    history: [],
  });
  return "System: Chat has been reset";
}

// Simplified chat handler
async function startChat(prompt) {
  try {
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    return typeof response === "string" ? JSON.parse(response) : response;
  } catch (err) {
    return {
      type: "response",
      thinking: "Error occurred",
      response: `System: ${err}`,
    };
  }
}

// Main emulation function with simplified error handling
async function emulateAgent(prompt) {
  try {
    const response = await startChat(prompt);
    console.log(JSON.stringify(response));
    switch (response.type) {
      case "response":
        return response.response;

      case "function": {
        let metaData = [];
        if (response.metaData) {
          metaData = response.metaData
            .split("::")
            .map((element) => element.trim());
        }

        let result;
        switch (response.function) {
          case "readDir":
            result = await readDir(...metaData);
            break;
          case "renameFile":
            result = await renameFile(...metaData);
            break;
          case "deleteFile":
            result = await deleteFile(...metaData);
            break;
          case "createFile":
            result = await createFile(...metaData);
            break;
          case "createDir":
            result = await createDir(...metaData);
            break;
          case "readImages":
            result = await readImages(metaData);
            return await emulateAgent(result);
          case "readAudio":
            result = await readAudio(...metaData);
            return await emulateAgent(result);
          case "readVideo":
            result = await readVideo(...metaData);
            return await emulateAgent(result);
          case "takeWebScreenshot":
            result = await takeWebScreenshot(...metaData);
            break;
          case "deleteFolder":
            result = await deleteFolder(...metaData);
            break;
          default:
            result = "System: Function doesn't exist.";
        }

        return await emulateAgent(JSON.stringify(result));
      }

      default:
        return emulateAgent("Provide a valid function");
    }
  } catch {
    return emulateAgent("Provide a valid type");
  }
}

export { emulateAgent, resetChat };
