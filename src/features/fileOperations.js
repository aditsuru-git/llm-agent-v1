import fs from "fs";
import path from "path";
import { isInPlayground } from "../utils/validate.js";

function readDir(directory) {
  try {
    if (!fs.existsSync(directory))
      return {
        status: "error",
        message: "System: Path of the target directory doesn't exist",
      };
    if (!isInPlayground(directory))
      return { status: "error", message: "System: Directory out of reach" };
    const files = [];
    fs.readdirSync(directory, { withFileTypes: true }).forEach((fileObject) => {
      files.push({
        file: fileObject.name,
        path: path.join(directory, fileObject.name),
        type: fileObject.isDirectory() ? "Directory" : "File",
      });
    });
    return { status: "success", data: files };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function renameFile(oldPath, newPath) {
  try {
    if (!fs.existsSync(oldPath))
      return {
        status: "error",
        message: "System: Path of the target file doesn't exist",
      };
    if (!(isInPlayground(oldPath) && isInPlayground(newPath)))
      return { status: "error", message: "System: File out of reach" };
    fs.renameSync(oldPath, newPath);
    return { status: "success", message: "System: Renamed file successfully" };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function deleteFile(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return {
        status: "error",
        message: "System: Path of the target file doesn't exist",
      };
    if (!isInPlayground(filePath))
      return { status: "error", message: "System: File out of reach" };
    fs.unlinkSync(filePath);
    return { status: "success", message: "System: File deleted successfully" };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function createFile(filePath, content = "") {
  try {
    if (!isInPlayground(filePath))
      return { status: "error", message: "System: File out of reach" };
    fs.writeFileSync(filePath, content);
    return { status: "success", message: "System: File created successfully" };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't create file: ${err.message}`,
    };
  }
}

function createDir(directory) {
  try {
    if (!isInPlayground(directory))
      return { status: "error", message: "System: Directory out of reach" };
    if (fs.existsSync(directory))
      return { status: "error", message: "System: Directory already exists" };
    fs.mkdirSync(directory, { recursive: true });
    return {
      status: "success",
      message: "System: Directory created successfully",
    };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't create directory: ${err.message}`,
    };
  }
}

function deleteFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath))
      return {
        status: "error",
        message: "System: Path of the target folder doesn't exist",
      };
    if (!isInPlayground(folderPath))
      return { status: "error", message: "System: Directory out of reach" };

    fs.rmSync(folderPath, { recursive: true, force: true });
    return {
      status: "success",
      message: "System: Folder deleted successfully",
    };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath))
      return {
        status: "error",
        message: "System: Path of the target file doesn't exist",
      };

    if (fs.lstatSync(filePath).isDirectory())
      return {
        status: "error",
        message: "System: Target path is a directory, not a file",
      };

    if (!isInPlayground(filePath))
      return { status: "error", message: "System: File out of reach" };
    const result = fs.readFileSync(filePath, "utf8");
    return { status: "success", data: result };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function editFile(filePath, data = "") {
  try {
    if (!fs.existsSync(filePath))
      return {
        status: "error",
        message: "System: Path of the target file doesn't exist",
      };

    if (fs.lstatSync(filePath).isDirectory())
      return {
        status: "error",
        message: "System: Target path is a directory, not a file",
      };

    if (!isInPlayground(filePath))
      return { status: "error", message: "System: File out of reach" };
    fs.writeFileSync(filePath, data);
    return { status: "success", message: "System: Success" };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
  }
}

function appendFile(filePath, data = "") {
  try {
    if (!fs.existsSync(filePath))
      return {
        status: "error",
        message: "System: Path of the target file doesn't exist",
      };

    if (fs.lstatSync(filePath).isDirectory())
      return {
        status: "error",
        message: "System: Target path is a directory, not a file",
      };

    if (!isInPlayground(filePath))
      return { status: "error", message: "System: File out of reach" };
    fs.appendFileSync(filePath, data);
    return { status: "success", message: "System: Success" };
  } catch (err) {
    return {
      status: "error",
      message: `System: Couldn't perform operation: ${err.message}`,
    };
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
