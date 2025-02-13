import fs from "fs";
import { isInPlayground } from "./validate.js";

function readDir(directory) {
  try {
    if (!fs.existsSync(directory))
      return "Path of the target directory doesn't exist";
    if (!isInPlayground(directory))
      return "Can't access directory outside the playground";
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
    return `Couldn't perform operation: ${err}`;
  }
}

function renameFile(oldPath, newPath) {
  try {
    if (!fs.existsSync(oldPath)) return "Path of the target file doesn't exist";
    if (!(isInPlayground(oldPath) && isInPlayground(newPath)))
      return "Can't access files outside the playground";
    fs.renameSync(oldPath, newPath);
    return "Renamed file successfully";
  } catch (err) {
    return `Couldn't perform operation: ${err}`;
  }
}

function deleteFile(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return "Path of the target file doesn't exist";
    if (!isInPlayground(filePath))
      return "Can't access file outside the playground";
    fs.unlinkSync(filePath);
    return "File deleted successfully";
  } catch (err) {
    return `Couldn't perform operation: ${err}`;
  }
}

function createFile(filePath, content = "") {
  try {
    if (!isInPlayground(filePath))
      return "Can't access files outside the playground";
    fs.writeFileSync(filePath, content);
    return "File created successfully";
  } catch (err) {
    return `Couldn't create file: ${err.message}`;
  }
}

function createDir(directory) {
  try {
    if (!isInPlayground(directory))
      return "Can't access directory outside the playground";
    if (fs.existsSync(directory)) return "Directory already exists";
    fs.mkdirSync(directory, { recursive: true });
    return "Directory created successfully";
  } catch (err) {
    return `Couldn't create directory: ${err.message}`;
  }
}

function deleteFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath))
      return "Path of the target folder doesn't exist";
    if (!isInPlayground(folderPath))
      return "Can't access folder outside the playground";

    fs.rmSync(folderPath, { recursive: true, force: true });
    return "Folder deleted successfully";
  } catch (err) {
    return `Couldn't perform operation: ${err}`;
  }
}

export { readDir, renameFile, deleteFile, createFile, createDir, deleteFolder };
