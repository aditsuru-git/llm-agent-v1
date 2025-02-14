# AI AGENT

A command-line chat application that lets you interact with a LLM agent, powered by Google's Gemini AI.

## Features

- Interactive CLI chat interface with color-coded messages
- Different personality/character support
- Chat history management with reset functionality
- Customizable UI colors through configuration
- File system operations support
- Media handling capabilities (images, audio, video)
- Web screenshot functionality
- Stateful conversation with context retention

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
npm run test
```

### Features

- View images, videos, and listen to audio files
- Take screenshots of any webpage
- Perform CRUD operations on files and folders

> AI can only access files & folders inside `playground`

### Chat Commands

- `sayonara()` - Exit the chat
- `reset()` - Clear chat history and start fresh

## Customization

### Modifying UI Colors

Edit `src/config/styles.json` to customize the chat interface colors:

```json
{
  "welcome_color": "#ff8400",
  "instruction_color": "#828181",
  "user_color": "#00fff2",
  "chat_color": "#F0F8FF",
  "ai_color": "#ff0026"
}
```

### Adjusting Character Persona

Modify `src/config/persona.js` to adjust Model's personality traits and conversation style.

### Changing playground path

You can change the folder to which the AI has access to in `src/config//configPath.js` by changing

`export const playGroundPath = path.join(__dirname, "..", "..", "playground");`

## Dependencies

- `@google/generative-ai` - Google Gemini AI integration
- `chalk` - Terminal string styling
- `ora` - Elegant terminal spinners
- `dotenv` - Environment variable management
- `readline` - CLI interface handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
