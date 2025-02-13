import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { emulateAgent } from "./utils/gemini.js";
import { clearLine, cursorTo } from "readline";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const styles = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config", "styles.json"), "utf8")
);

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: "",
});

// Style configurations
const colors = {
  welcome: chalk.hex(styles.welcome_color),
  instruction: chalk.hex(styles.instruction_color),
  user: chalk.hex(styles.user_color).bold,
  chat: chalk.hex(styles.chat_color),
  ai: chalk.hex(styles.ai_color).bold,
  spinner: chalk.hex(styles.spinner_color),
  system: chalk.hex(styles.system_color).bold,
};

// Configure spinner
const spinner = ora({
  text: colors.spinner(`${styles.character_name} is thinking...`),
  color: "cyan",
  spinner: "dots",
});

// Clear terminal and show welcome message
console.clear();
console.log(colors.welcome("Chat to Chizuru!"));
console.log(colors.instruction.italic("(Type sayonara() to exit out)"));

// Prevent line duplication
const writePrompt = () => {
  process.stdout.write(colors.user("You: "));
};

// Main chat loop
async function chat() {
  try {
    // Remove the default prompt display
    rl.setPrompt("");

    // Write our custom prompt
    writePrompt();

    rl.on("line", async (input) => {
      // Clear the current line
      clearLine(process.stdout, 0);
      cursorTo(process.stdout, 0);

      // Handle exit command
      if (input.trim().toLowerCase() === "sayonara()") {
        console.log(colors.chat("\nThank you for chatting! Goodbye!"));
        process.exit(0);
      }

      // Display user's message properly formatted
      console.log(colors.user("You: ") + colors.chat(input));

      try {
        // Start thinking spinner
        spinner.start();

        // Get AI response
        const response = await emulateAgent(input);

        // Stop spinner and clear its line
        spinner.stop();
        clearLine(process.stdout, 0);
        cursorTo(process.stdout, 0);

        // Display AI response
        if (response.startsWith("System:")) {
          console.log(
            colors.system("System: ") + colors.chat(response.slice(8))
          );
        } else {
          console.log(
            colors.ai(`${styles.character_name}: `) + colors.chat(response)
          );
        }

        // Write the prompt for the next input
        writePrompt();
      } catch (err) {
        // Handle errors gracefully
        spinner.stop();
        clearLine(process.stdout, 0);
        cursorTo(process.stdout, 0);
        console.log(colors.system("System: ") + colors.chat(err.message));
        writePrompt();
      }
    });

    // Handle special key combinations
    rl.input.on("keypress", (_, key) => {
      if (key) {
        // Handle ctrl+c
        if (key.ctrl && key.name === "c") {
          console.log(colors.chat("\nChat ended by user. Goodbye!"));
          process.exit(0);
        }

        // Handle ctrl+d
        if (key.ctrl && key.name === "d") {
          if (rl.line.length === 0) {
            console.log(colors.chat("\nChat ended by user. Goodbye!"));
            process.exit(0);
          }
        }
      }
    });
  } catch (err) {
    console.error(colors.system("System: Fatal Error"));
    console.error(colors.chat(err.stack));
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  spinner.stop();
  console.error(colors.system("System: Uncaught Error"));
  console.error(colors.chat(err.stack));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  spinner.stop();
  console.error(colors.system("System: Unhandled Promise Rejection"));
  console.error(colors.chat(err.stack));
  process.exit(1);
});

// Start the chat
chat();
