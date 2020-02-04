const GooglePhotos = require('./google_photos');
const WebDav = require('./web_dav');
const fs = require('fs');

const env = JSON.parse(fs.readFileSync('env.json').toString());
const webdav = new WebDav(env['webdav_url']);
const gPhotos = new GooglePhotos(
  env['client_id'],
  env['client_secret'],
  env['redirect_uri'],
  'token.json'
);

const fetchAllImages = async () => {
  const allImages = new Array();
  const mimeTypes = ['image/jpeg'];
  let rootFiles = await webdav.fetchFilesInDirectory('/');
  rootFiles = rootFiles.filter((file) => file.type !== 'file');
  rootFiles = rootFiles.filter((file) => file.filename !== '/100__TSB');

  for (const folder of rootFiles) {
    let files = await webdav.fetchFilesInDirectory(folder.filename);
    files = files.filter((file) => mimeTypes.includes(file.mime));
    allImages.push(...files);
  }
  return allImages;
}

const sleep = async (sec) => {
  return new Promise ((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  })
}

const main = async () => {
  while (true) {
    console.log('polling... WebDAV');

    const allPhotos = await fetchAllImages().catch((error) => {
      console.error('failed to fetch');
      return [];
    });
    if (allPhotos.length > 0) {
      console.log(`...found ${allPhotos.length} files to process`);
    }

    for (const photo of allPhotos) {
      let success = false;
      const destination = 'images/' + photo.basename;
      success = await webdav.downloadFile(photo.filename, destination).catch((error) => {
        console.error('failed to download')
        console.error(error);
      });
      if (!success) continue;

      success = await gPhotos.uploadFile(destination).catch((error) => {
        console.error(error);
        console.error(error.message);
      });
      if (!success) continue;

      fs.unlinkSync(destination);
      await webdav.deleteFile(photo.filename).catch((error) => {
        console.error(error);
        console.error(error.message);
      });
    }

    await sleep(10);
  }
}

main();