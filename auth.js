const {google} = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = JSON.parse(fs.readFileSync('env.json').toString());
const oauth2Client = new google.auth.OAuth2(
  env['client_id'],
  env['client_secret'],
  env['redirect_uri'],
);

const scopes = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/photoslibrary.appendonly'
];

const getAccessToken = (code) => {
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = tokens;
    console.log(JSON.stringify(tokens));
  });
};

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});


console.log('access the url login to get the access token: ');
console.log(url);
rl.question('\nEnter the code here:  ', getAccessToken);
