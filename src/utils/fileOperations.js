import fs from "fs";
import { isInPlayground } from "./validate.js";

function readDir(directory) {
  try {
    if (!fs.existsSync(directory))
      return "System: Path of the target directory doesn't exist";
    if (!isInPlayground(directory)) return "System: Directory out of reach";
    const files = [];
    fs.readdirSync(directory, { withFileTypes: true }).forEach((fileObject) => {
      files.push({
        file: fileObject.name,
        path: fileObject.path,
        type: fileObject.isDirectory() ? "Directory" : "File",
      });
    });
    return files;
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function renameFile(oldPath, newPath) {
  try {
    if (!fs.existsSync(oldPath))
      return "System: Path of the target file doesn't exist";
    if (!(isInPlayground(oldPath) && isInPlayground(newPath)))
      return "System: File out of reach";
    fs.renameSync(oldPath, newPath);
    return "System: Renamed file successfully";
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function deleteFile(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return "System: Path of the target file doesn't exist";
    if (!isInPlayground(filePath)) return "System: File out of reach";
    fs.unlinkSync(filePath);
    return "System: File deleted successfully";
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function createFile(filePath, content = "") {
  try {
    if (!isInPlayground(filePath)) return "System: File out of reach";
    fs.writeFileSync(filePath, content);
    return "System: File created successfully";
  } catch (err) {
    return `System: Couldn't create file: ${err.message}`;
  }
}

function createDir(directory) {
  try {
    if (!isInPlayground(directory)) return "System: Directory out of reach";
    if (fs.existsSync(directory)) return "System: Directory already exists";
    fs.mkdirSync(directory, { recursive: true });
    return "System: Directory created successfully";
  } catch (err) {
    return `System: Couldn't create directory: ${err.message}`;
  }
}

function deleteFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath))
      return "System: Path of the target folder doesn't exist";
    if (!isInPlayground(folderPath)) return "System: Directory out of reach";

    fs.rmSync(folderPath, { recursive: true, force: true });
    return "System: Folder deleted successfully";
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return "System: Path of the target file doesn't exist";

    if (fs.lstatSync(filePath).isDirectory())
      return "System: Target path is a directory, not a file";

    if (!isInPlayground(filePath)) return "System: File out of reach";
    const result = fs.readFileSync(filePath, "utf8");
    return JSON.stringify(result);
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function editFile(filePath, data = "") {
  try {
    if (!fs.existsSync(filePath))
      return "System: Path of the target file doesn't exist";

    if (fs.lstatSync(filePath).isDirectory())
      return "System: Target path is a directory, not a file";

    if (!isInPlayground(filePath)) return "System: File out of reach";
    fs.writeFileSync(filePath, data);
    return "System: Success";
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

function appendFile(filePath, data = "") {
  try {
    if (!fs.existsSync(filePath))
      return "System: Path of the target file doesn't exist";

    if (fs.lstatSync(filePath).isDirectory())
      return "System: Target path is a directory, not a file";

    if (!isInPlayground(filePath)) return "System: File out of reach";
    fs.appendFileSync(filePath, data);
    return "System: Success";
  } catch (err) {
    return `System: Couldn't perform operation: ${err}`;
  }
}

export {
  readDir,
  renameFile,
  deleteFile,
  createFile,
  createDir,
  deleteFolder,
  readFile,
  editFile,
  appendFile,
};
