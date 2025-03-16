> This was my first working version—it's messy and buggy, but it helped me understand the fundamentals. Feel free to check it out, but **version 2 will be a much cleaner, improved version.**

# AI AGENT

A CLI-based AI agent powered by Google's Gemini.

## Prerequisites

- Node.js (v14.0.0 or higher)
- Google Gemini API key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/aditsuru-git/llm-agent.git
```

2. Install dependencies:

```bash
npm install
```

3. Edit `.env` and add your Google Gemini API key:

```
API_KEY=your_gemini_api_key_here
```

4. Delete all the `.gitkeep` files from `playground`

## Usage

Start the chat application:

```bash
npm run start
```

### Features

- View images, videos, and listen to audio files
- Take screenshots of any webpage
- Perform CRUD operations on files and folders

> AI can only access files & folders inside a root directory specified in `src/config/configPath.js`

### Chat Commands

- `sayonara()` - Exit the chat
- `reset()` - Clear chat history and start fresh

## Customization Guide

### Overview

This chatbot can be customized to fit your needs, from appearance to personality and file access. Below are the key customization options.

---

### UI Customization

Modify `src/config/styles.json` to change the chat interface colors:

```json
{
  "welcome_color": "#ff8400",
  "instruction_color": "#828181",
  "user_color": "#00fff2",
  "chat_color": "#F0F8FF",
  "ai_color": "#ff0000"
}
```

Update these values to your preferred hex colors.

---

### Personality Customization

Edit `src/config/persona.js` to adjust the AI's persona, speech style, and behavior.

For example, to modify how the AI interacts, tweak the `persona` constant:

```js
export const persona = `
1: Identity:
You are [Your AI Name]...
`;
```

- Make changes to the character's traits, tone, or role as needed.
- Note: Be sure to update the chat history as well to ensure the persona changes take full effect.
---

### Playground Path Customization

Change the AI's accessible root directory in `src/config/configPath.js` by modifying:

```js
export const playGroundPath = path.join(__dirname, "..", "..", "playground");
```

Update this path to point to a different directory.

---

### User Information Customization

Update `src/config/userInfo.js` to personalize the chatbot's knowledge of the user:

```js
export const userInfo = `I'm [Your Name], a [Your Role]...`;
```

This allows the AI to tailor responses based on user details.

---

### Chat History Management

Modify `src/config/chatHistory.js` to control past conversations. This enables the chatbot to adhere more accurately to the persona.

Example format:

```js
export const chatHistory = [
  { role: "user", parts: [{ text: "Hello!" }] },
  { role: "model", parts: [{ text: "Hey there!" }] },
];
```

Clear or edit history as needed.

---

### Additional Configuration

- Utility functions: Located in `src/utils/` (e.g., `fileOperations.js`, `validate.js`).
- AI behavior rules: Managed in `src/config/systemInstructions.js`.

Customize these as needed to refine the chatbot's functionality.

## Dependencies

- `@google/generative-ai` - Google Gemini AI integration
- `chalk` - Terminal string styling
- `ora` - Elegant terminal spinners
- `dotenv` - Environment variable management
- `readline` - CLI interface handling
