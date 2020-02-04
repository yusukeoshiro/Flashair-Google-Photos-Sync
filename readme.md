# Toshiba Flashair and Google Photo Sync
This program will run in a server that runs in the same network as the Flashair.

It will automatically poll the SD Card over WiFi and backup any new files in Google Photos.


#### Requirements
- Flashair must be configured to host WebDAV server
- Flashair must connect to your home WiFi (read the excellent article on [this blog](https://kapibara-sos.net/archives/577))
- Flashair must be on the same network as the server that runs this program and it must be IP reachable


#### How it works
This program will scan for the files (images and videos) on the SD Card periodically.

If new files are found, it will download the file over WiFi and upload it to your Google Photo account.

#### Authenticating with Google Photos
you will need to configure `env.json` at the root fo the folder that looks like...
```
{
  "client_id": "****************",
  "client_secret": "****************",
  "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
  "webdav_url": "http://192.168.86.99/DCIM"
}
```
Next run the command `node auth.js`, which will generate authentication url, which you can use to authenticate with your google accout. If you do this step correctly, the program will show you a JSON file, which should be stored as `token.json`. It looks something like this:

```
{
    "access_token": "***",
    "refresh_token": "***",
    "scope": "https://www.googleapis.com/auth/photoslibrary.appendonly openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    "token_type": "Bearer",
    "id_token": "***",
    "expiry_date": 1580749927198
}
```

#### Building it
After creating `env.json` and `token.json`, build the container image with `docker build .`.

---

## random stuff
```
TAG="asia.gcr.io/$(gcloud config get-value project)/webdav-sync-for-sd-card"
echo $TAG
docker build . -t $TAG
docker push asia.gcr.io/metroly-smart-lock-dev/webdav-sync-for-sd-card
```