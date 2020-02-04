const {google} = require('googleapis');
const Photos = require('googlephotos');
const fs = require('fs');
const path = require('path');

module.exports = class GooglePhotos {
  constructor (clientId, clientSecret, redirectUrl, tokenFilePath) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUrl
    );
    const token = JSON.parse(fs.readFileSync(tokenFilePath).toString());
    this.oauth2Client.credentials = token;
  }
  async accessToken () {
    console.log('getting access token...');
    if (this.oauth2Client.isTokenExpiring()) {
      const cred = await this.oauth2Client.refreshAccessToken().catch((error) => {
        console.error(error);
        console.error(error.message);
        throw new Error('REFRESH_TOKEN_ERROR');
      });
      console.log('...done');
      return cred.credentials.access_token;
    } else {
      console.log('previous access token is still fresh');
      return this.oauth2Client.accessToken;
    }
  }

  async getClient () {
    if (this.client === undefined) {
      this.client = new Photos(await this.accessToken());
    }
    return this.client;
  }

  async uploadFile (filePath, albumId=null) {
    console.log(`uploading ${filePath}...`);
    const fileName = path.basename(filePath);
    const photoClient = await this.getClient();

    // validate file
    if (!fs.existsSync(filePath)) throw new Error(`${filePath} does not exist`);

    // upload
    const response = await photoClient.mediaItems.upload(albumId, fileName, filePath, null).catch((error) => {
      console.error(error);
      throw new Error('UPLOAD_ERROR');
    });
    if (response.newMediaItemResults[0].status.message !== 'Success') {
      console.error(response.newMediaItemResults[0]);
      throw new Error('UPLOAD_ERROR');
    }
    console.log(`uploaded ${filePath} to google photos`);
    return true;
  }
}