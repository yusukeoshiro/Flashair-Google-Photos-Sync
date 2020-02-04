const { createClient } = require("webdav");
const fs = require('fs');


module.exports = class WebDav {
  constructor(url) {
    this.client = createClient(url);
  }

  fetchFilesInDirectory (directory) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject();
      }, 3000);
      this.client.getDirectoryContents(directory)
        .then((files) => {
          resolve(files);
        })
        .catch((error) => {
          reject();
        })
        .finally(() => {
          clearTimeout(timeoutId);
        });
    });
  }

  deleteFile (filePath) {
    return new Promise((resolve, reject) => {
      this.client.deleteFile(filePath)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  // download from source path (remote) to destination path (local)
  downloadFile (sourcePath, destinationPath) {
    return new Promise((resolve, reject) => {
      console.log(`downloading ${sourcePath}`);
      const src = this.client.createReadStream(sourcePath);
      const dest = fs.createWriteStream(destinationPath);
      const stream = src.pipe(dest);
      let lastCheckinTime = new Date();
      let lastCheckedSize = 0;

      let id;
      stream.on('finish', () => {
        clearInterval(id);
        resolve(true);
      });
      stream.on('error', () => {
        clearInterval(id);
        reject();
      });

      id = setInterval(() => {
        // console.log('download check-in time arrived...');
        const stats = fs.statSync(destinationPath);
        const fileSize = stats['size'] / 1000;

        if ( fileSize === lastCheckedSize ) {
          console.log('unfortunately download failed. deleting any partially downloaded files...');
          clearInterval(id);
          src.destroy();
          dest.destroy();
          stream.destroy();
          if (fs.existsSync(destinationPath)) {
            fs.unlinkSync(destinationPath);
          }
          reject();
        } else {
          console.log(`still downloading... [${fileSize} kb]`);
          lastCheckedSize = fileSize;
        }
      }, 10000);
    })
  }


}