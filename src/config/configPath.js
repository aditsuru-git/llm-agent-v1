import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to playground folder
export const playGroundPath = path.join(__dirname, "..", "..", "playground");
