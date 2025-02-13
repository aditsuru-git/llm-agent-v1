import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { emulateAgent, resetChat } from "./utils/gemini.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load styles
const stylesPath = path.join(__dirname, "config", "styles.json");
const styles = JSON.parse(fs.readFileSync(stylesPath, "utf8"));

// Define colors using Chalk
const colors = {
  welcome: chalk.hex(styles.welcome_color),
  instruction: chalk.hex(styles.instruction_color),
  user: chalk.hex(styles.user_color).bold,
  chat: chalk.hex(styles.chat_color),
  ai: chalk.hex(styles.ai_color).bold,
  spinner: chalk.hex(styles.spinner_color),
  system: chalk.hex(styles.system_color).bold,
};

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "",
});

// Chat history
let chatHistory = [];

// Function to clear screen and display chat history
const displayChatHistory = () => {
  console.clear();
  console.log(colors.welcome("Chat to Chizuru!\n"));
  console.log(colors.instruction("(Type sayonara() to exit)"));
  console.log(colors.instruction("(Type reset() to clear history)\n"));
  chatHistory.forEach(({ role, content }) => {
    console.log(
      colors[role](`${role === "user" ? "You" : styles.character_name}: `) +
        colors.chat(content)
    );
  });
  process.stdout.write(colors.user("You: "));
};

// Process user input
const handleInput = async (input) => {
  if (!input.trim()) return;

  if (input.trim().toLowerCase() === "sayonara()") {
    console.log(colors.chat("\nThank you for chatting! Goodbye!"));
    rl.close();
    process.exit(0);
  }

  if (input.trim().toLowerCase() === "reset()") {
    console.log(
      colors.system("System: ") + colors.chat("Resetting chat history...\n")
    );
    resetChat();
    chatHistory = [];
    displayChatHistory();
    return;
  }

  chatHistory.push({ role: "user", content: input });
  displayChatHistory();

  const spinner = ora({
    text: colors.spinner(`${styles.character_name} is thinking...`),
    spinner: "dots",
  }).start();
  spinner.color = "red";
  try {
    const response = await emulateAgent(input);
    spinner.stop();
    process.stdout.write("\r\x1b[K");
    chatHistory.push({ role: "ai", content: response });
    displayChatHistory();
  } catch (err) {
    spinner.stop();
    process.stdout.write("\r\x1b[K");
    console.log(colors.system("System: ") + colors.chat("An error occurred."));
  }
};

// Start chat
const startChat = () => {
  displayChatHistory();
  rl.on("line", async (input) => {
    if (input.trim().toLowerCase() === "sayonara()") {
      console.log(colors.system("\nThank you for chatting! Goodbye!"));
      rl.close();
      process.exit(0);
    }
    process.stdout.write("\x1B[1A\x1B[2K");
    console.log(colors.user("You: ") + colors.chat(input));
    await handleInput(input);
  });

  rl.on("SIGINT", () => {
    console.log(colors.chat("\nChat ended by user. Goodbye!"));
    process.exit(0);
  });
};

startChat();
