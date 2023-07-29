## What is this? 🎵
This repository uses a simple script to check whether the public playlists for a given Spotify account have changed.

## How does it work? 🤔
Currently, it just compares the number of tracks for a given playlist (although in the future it might be improved to check for the names and artists of playlists, or create a md5 fingerprint hash of the tracks).

So in a nutshell:
1. Spotify is accessed to check the public playlists for a user
2. If there is a change then a notification is sent
3. The playlist data is stored to be used for next time when checking for changes

## How to use this? 🎉

### The Boring Stuff 🤓
Set all of the secret values as defined in the GitHub action settings. You'll need a few things:

- `SPOTIFY_CLIENT_SECRET`: The Spotify secret for your App. You will need to create a this on Spotify Developers.
- `SPOTIFY_CLIENT_ID`: The client id for your App (also found on Spotify Developers).
- `SPOTIFY_USER_ID`: The id of the user playlists you wish to stalk :) (This can be found at the end the profile URL such as `https://open.spotify.com/user/useridisfoundhere`).
- `EMAILS`: A comma separated list of email addresses to receive the notification (via email of course).
- `SMTP_HOST`: The mail server host to send the emails from.
- `SMTP_PASSWORD`: The password for the mail server.
- `SMTP_USERNAME`: The username for the mail server.
- `SMTP_PORT`: The server port for the mail server (a secure default port is used if this is not provided).

> Pro Tip: You can use your personal email account if you can't afford a mail server. Although, if you're using GMAIL, you should just create a separate email for this specific purpose.

### Running Manually 😏
You can run this script manually by doing `yarn dist` then `cd ./dist` and `node index.js` (don't forget to set the environment variables!). If you want, you can even set this up as as cronjob on your own computer or server. However, this repo uses the Github actions to do this because its free 🤑.

### Running The Tests 📈
Pffft, who needs tests when everything you do is perfect? Ok, seriously though, let's just say this is "In Progress".

> WARNING: I found a cool plugin in my IDE to insert emoji's, so I apologise for the emotional rollercoaster this may have caused.
