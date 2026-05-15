const querystring = require('querystring');

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

let access_token = null;
let refresh_token = null;

function getLoginURL() {
  const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing"
  ].join(" ");

  return (
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id,
      scope,
      redirect_uri
    })
  );
}

async function getTokens(code) {
  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri
      })
    }
  );

  const data = await response.json();

  access_token = data.access_token;
  refresh_token = data.refresh_token;

  return data;
}

async function getCurrentSong() {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

async function pausePlayback() {
  await fetch(
    "https://api.spotify.com/v1/me/player/pause",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );
}

async function playPlayback() {
  await fetch(
    "https://api.spotify.com/v1/me/player/play",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );
}

async function  previousPlay() {
  await fetch(
    "https://api.spotify.com/v1/me/player/previous", 
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  )
}

async function nextPlay() {
  await fetch(
    "https://api.spotify.com/v1/me/player/next", 
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  )
}

module.exports = {
  getLoginURL,
  getTokens,
  getCurrentSong,
  pausePlayback,
  playPlayback,
  previousPlay,
  nextPlay
};