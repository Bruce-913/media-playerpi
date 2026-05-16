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

async function refreshAccessToken() {
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
        grant_type: "refresh_token",
        refresh_token
      })
    }
  );

  const data = await response.json();

  access_token = data.access_token;

  return access_token;
}

function getAccessToken() {
  return access_token;
}

function getRefreshtoken() {
  return refresh_token;
}

// async function getCurrentSong() {

//   if (!access_token) {
//     console.log("No access token yet");
//     return null;
//   }
//   console.log("ACCESS TOKEN:", access_token);
//   const response = await fetch(
//     "https://api.spotify.com/v1/me/player/currently-playing",
//     {
//       headers: {
//         Authorization: `Bearer ${access_token}`
//       }
//     }
//   );

//   if (response.status === 204) {
//     return null;
//   } else if (response.status === 429) {
//     console.warn("exceeded rate limits")
//     return null
//   } else if (!response.ok) {
//     console.warn("spotify API error: ", await response.text());
//   } else {
//     return await response.json();
//   }

//   // return await response.json();
// }

async function getCurrentSong() {
  if (!access_token) {
    console.log("No access token yet");
    return null;
  }

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
  } else if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 5;
    console.warn(`Rate limited. Retry after ${retryAfter}s`);
    return { rateLimited: true, retryAfter: parseInt(retryAfter) };
  } else if (!response.ok) {
    console.warn("Spotify API error:", await response.text());
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

async function seekTime(position_ms) {
  await fetch(
    `https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`,
    {
      method: "PUT",
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
  nextPlay,
  seekTime,
  getAccessToken,
  getRefreshtoken
};

setInterval(async () => {
  try {
    await refreshAccessToken();
    console.log("Access token refreshed");
  } catch (err) {
    console.error("Token refresh failed:", err.message);
  }
}, 1000 * 60 * 50);