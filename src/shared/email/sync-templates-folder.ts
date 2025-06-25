const fs = require("fs");
const logger = require("@/shared/common/logger");

const syncTemplatesFolder = async () => {
  try {
    const templateFolderDist = `${__dirname}/templates/`;
    const templateFolderSrc = templateFolderDist.replace("dist\\", "src\\");
    createDirectorySync(templateFolderDist);
    syncFolders(templateFolderSrc, templateFolderDist)
      .then(() => logger.info("Folders synchronized successfully!"))
      .catch((error) => logger.error("Error synchronizing folders:", error));
  } catch (error) {}
};

const copyFile = (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.access(destinationPath, fs.constants.F_OK, (err: Error) => {
      if (err) {
        fs.copyFile(sourcePath, destinationPath, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        process.stdin.once("data", (data) => {
          if (data.toString().trim().toLowerCase() === "y") {
            fs.copyFile(sourcePath, destinationPath, (err: Error) => {
              if (err) reject(err);
              else resolve();
            });
          } else {
            resolve();
          }
        });
      }
    });
  });
};

const syncFolders = (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readdir(sourcePath, (err: any, files: any[]) => {
      if (err) reject(err);
      else {
        Promise.all(
          files.map(async (file: any) => {
            const sourceFilePath = `${sourcePath}/${file}`;
            const destinationFilePath = `${destinationPath}/${file}`;

            const stats: any = await new Promise((resolve, reject) => {
              fs.stat(sourceFilePath, (err: Error, stat: unknown) => {
                if (err) reject(err);
                else resolve(stat);
              });
            });

            if (stats.isDirectory()) {
              await fs.promises.mkdir(destinationFilePath, { recursive: true });
              return syncFolders(sourceFilePath, destinationFilePath);
            } else {
              return copyFile(sourceFilePath, destinationFilePath);
            }
          })
        )
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

const createDirectorySync = (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
    logger.info(`Directory created at: ${directoryPath}`);
  } else {
    logger.warn(`Directory already exists: ${directoryPath}`);
  }
};

module.exports = syncTemplatesFolder;
