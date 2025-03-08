import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { emulateAgent } from "./app.js";
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

let chatHistory = [];

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
};

const getUserInput = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(colors.user("You: "), (input) => {
      rl.close();
      resolve(input);
    });
  });
};

const handleInput = async (input) => {
  const trimmedInput = input.trim();
  if (!trimmedInput) return true;

  if (trimmedInput.toLowerCase() === "sayonara()") {
    console.log(colors.chat("\nThank you for chatting! Goodbye!"));
    return false;
  }

  if (trimmedInput.toLowerCase() === "reset()") {
    console.log(
      colors.system("System: ") + colors.chat("Resetting chat history...\n")
    );
    chatHistory = [];
    displayChatHistory();
    return true;
  }

  chatHistory.push({ role: "user", content: trimmedInput });
  displayChatHistory();

  const spinner = ora({
    text: colors.spinner(`${styles.character_name} is thinking...`),
    spinner: "dots",
  }).start();
  spinner.color = "red";

  try {
    const response = await emulateAgent(trimmedInput);
    spinner.stop();
    chatHistory.push({ role: "ai", content: response });
    displayChatHistory();
  } catch (err) {
    spinner.stop();
    console.log(colors.system("System: ") + colors.chat("An error occurred."));
  }
  return true;
};

async function main() {
  displayChatHistory();

  let running = true;
  while (running) {
    const input = await getUserInput();
    running = await handleInput(input);
  }
  process.exit(0);
}

// Handle SIGINT gracefully
process.on("SIGINT", () => {
  console.log(colors.chat("\nChat ended by user. Goodbye!"));
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
