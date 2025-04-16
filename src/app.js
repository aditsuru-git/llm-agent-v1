import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { systemInstructions } from "./config/systemInstructions.js";
import schema from "./config/schema.js";
import * as fileOps from "./features/fileOperations.js";
import { readImages } from "./features/readImages.js";
import { takeWebScreenshot } from "./features/webScraper.js";
import { readAudio } from "./features/readAudio.js";
import { readVideo } from "./features/readVideos.js";
import { persona } from "./config/persona.js";
import { chatHistory } from "./config/chatHistory.js";

dotenv.config();

// Constants
const TIMEOUT_MS = 30000;
const MODEL_NAME = "gemini-2.0-flash";
const META_DATA_SEPARATOR = "::";

// Function mapping to avoid switch statement
const functionMap = {
	readDir: fileOps.readDir,
	renameFile: fileOps.renameFile,
	deleteFile: fileOps.deleteFile,
	createFile: fileOps.createFile,
	createDir: fileOps.createDir,
	deleteFolder: fileOps.deleteFolder,
	readFile: fileOps.readFile,
	editFile: fileOps.editFile,
	appendFile: fileOps.appendFile,
	readImages: async (metaData) => {
		const result = await readImages(metaData);
		return emulateAgent(result);
	},
	readAudio: async (...metaData) => {
		const result = await readAudio(...metaData);
		return emulateAgent(result);
	},
	readVideo: async (...metaData) => {
		const result = await readVideo(...metaData);
		return emulateAgent(result);
	},
	takeWebScreenshot,
};

// Initialize AI model
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
	model: MODEL_NAME,
	systemInstruction: `${persona}\n${systemInstructions}\n`,
	generationConfig: {
		responseMimeType: "application/json",
		responseSchema: schema,
	},
});

let chat = initializeChat();

function initializeChat() {
	return model.startChat({ history: chatHistory });
}

function resetChat() {
	chat = initializeChat();
	return "System: Chat has been reset";
}

async function startChat(prompt) {
	if (!prompt || typeof prompt !== "string") {
		throw new Error("Invalid prompt provided");
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

		const result = await chat.sendMessage(prompt, { signal: controller.signal });
		clearTimeout(timeoutId);

		const response = result.response.text();
		return typeof response === "string" ? JSON.parse(response) : response;
	} catch (err) {
		if (err.name === "AbortError") {
			throw new Error("Request timed out");
		}
		throw new Error(`Chat error: ${err.message}`);
	}
}

async function emulateAgent(prompt) {
	try {
		const response = await startChat(prompt);

		if (!response || !response.type) {
			throw new Error("Invalid response format");
		}

		if (response.type === "response") {
			return response.response;
		}

		if (response.type === "function") {
			const func = functionMap[response.function];
			if (!func) {
				throw new Error(`Unknown function: ${response.function}`);
			}

			const metaData = response.metaData
				? response.metaData.split(META_DATA_SEPARATOR).map((element) => element.trim())
				: [];

			const result = await func(...metaData);
			return await emulateAgent(JSON.stringify(result));
		}

		throw new Error("Invalid response type");
	} catch (err) {
		console.error("Emulation error:", err);
		return emulateAgent(`System: ${err.message}`);
	}
}

export { emulateAgent, resetChat };
