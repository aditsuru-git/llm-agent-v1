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
} from "./fileOperations.js";
import { readImages } from "./readImages.js";
import { takeWebScreenshot } from "./webScraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

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

const chat = model.startChat({
  history: [],
});

async function startChat(prompt) {
  try {
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    return typeof response === "string" ? JSON.parse(response) : response;
  } catch (error) {
    console.error("Chat error:", error);
    return {
      type: "response",
      thinking: "Error occurred",
      response: "Sorry, I encountered an error processing your request.",
    };
  }
}

async function emulateAgent(prompt) {
  try {
    const response = await startChat(prompt);
    console.log(response);
    switch (response.type) {
      case "response":
        return response.response;
      case "function":
        console.log("function was called: ", response.function);
        let metaData = [];
        if (response.metaData) {
          metaData = response.metaData
            .split(",")
            .map((element) => element.trim());
          console.log("metaData: ", metaData);
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
            result = await readImages(...metaData);
            break;
          case "takeWebScreenshot":
            result = await takeWebScreenshot(...metaData);
            break;
          default:
            result = "System: Function doesn't exist.";
        }
        return await emulateAgent(JSON.stringify(result));

      default:
        return await emulateAgent("System: Provide a valid 'type'");
    }
  } catch (error) {
    console.error("Emulation error:", error);
    return "System: An error occurred while processing your request.";
  }
}

export { emulateAgent };
