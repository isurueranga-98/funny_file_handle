const fs = require("fs/promises");

(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    try {
      const existingFileHandle = await fs.open(path, "r");
      console.log(`The file ${path} already exists`);
      existingFileHandle.close();
    } catch (e) {
      const newFileHandle = await fs.open(path, "w");
      console.log(`A new file "${path}" successfully created`);
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log(`Deleted the file "${path}"`);
    } catch (err) {
      if(err.code === "ENOENT"){
        console.log("No file at this path to remove.")
      }else{
        console.log("An error occurred while removing the file");
        console.log(err);
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log(`Renamed file from "${oldPath}" to "${newPath}"`);
    } catch (err) {
      if(err.code === "ENOENT"){
        console.log("No file at this path to rename.")
      }else{
        console.log("An error occurred while renaming the file");
        console.log(err);
      }
    }
  };

  const addToFile = async (path, content) => {
    try {
      await fs.appendFile(path, content);
      console.log(`Added content to "${path}": "${content}"`);
    } catch (err) {
      console.error(`Error adding content to file "${path}":`, err);
    }
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf-8");

    if (command.includes(CREATE_FILE)) {
      const filepath = command.substring(CREATE_FILE.length + 1).trim();
      await createFile(filepath);
    }

    if (command.includes(DELETE_FILE)) {
      const filepath = command.substring(DELETE_FILE.length + 1).trim();
      await deleteFile(filepath);
    }

    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx).trim();
      const newFilePath = command.substring(_idx + 4).trim();
      await renameFile(oldFilePath, newFilePath);
    }

    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filepath = command.substring(ADD_TO_FILE.length + 1, _idx).trim();
      const content = command.substring(_idx + 15).trim();
      await addToFile(filepath, content);
    }
  });

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
