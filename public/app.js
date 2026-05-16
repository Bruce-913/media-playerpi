let trackPlayStatus = false;
let pollTimeoutId = null;

async function startUpdating() {
  if (pollTimeoutId !== null) return; // already running, bail out

  const run = async () => {
    await updateUI();
    pollTimeoutId = setTimeout(run, 1000);
  };

  await run();
}

function stopUpdating() {
  clearTimeout(pollTimeoutId);
  pollTimeoutId = null;
}

async function updateUI() {
  const res = await fetch("/currentInfo");
  const data = await res.json();

  // If rate limited, back off
  if (data && data.rateLimited) {
    const backoff = (data.retryAfter * 1000) + 1000;
    console.warn(`Rate limited, backing off ${backoff}ms`);
    pollInterval = Math.max(pollInterval, backoff);
    return;
  }

  pollInterval = 3000

  if (!data || !data.item) return;

  trackPlayStatus = data.is_playing

  const progressBar = document.getElementById("progressBar");

  const songDuration = data.item.duration_ms
  const songProgress = data.progress_ms

  const songDurationMinutes = Math.floor((songDuration * 0.001) / 60);
  const remainderDurationSeconds = Math.floor(((songDuration * 0.001) % 60));
  const formattedSongDur = `${songDurationMinutes}:${remainderDurationSeconds.toString().padStart(2, "0")}`;

  const songMinutes = Math.floor((songProgress * 0.001) / 60);
  const remainderSeconds = Math.floor(((songProgress * 0.001) % 60));
  const formattedCurrentTime = `${songMinutes}:${remainderSeconds.toString().padStart(2, "0")}`;

  const barPercent = (songProgress / songDuration) * 100
 
  document.getElementById("currentTime").innerText = formattedCurrentTime
  document.getElementById("songLength").innerText = formattedSongDur
  document.getElementById("progressBar").value = barPercent

  document.getElementById("songName").innerText =
    data.item.name;

  document.getElementById("artistName").innerText =
    data.item.artists[0].name;

  document.getElementById("albumArt").src =
    data.item.album.images[0].url;

  if (!draggingElement) {
    progressBar.value = barPercent;
  }
};

// setInterval(updateUI, 10000);

const playPreviousSong = document.getElementById('prevButton')
const playNextSong = document.getElementById('nextButton')
const playPauseButton = document.getElementById('playPauseButton')
const playPauseicon = document.getElementById("playPauseIcon")

const progressManipulation = document.getElementById('progressBar')

playPreviousSong.addEventListener("click", async() => {
    await fetch("/playPreviousSong", {
        method: "POST"
    })
})

// pseudo code for playPauseButton
// if data.is_playing == true
// run pause button and hide play button
// else if data.is_playing == false
// run play button and hide pause
// else not logged in and hide all



playPauseButton.addEventListener("click", async () => {
    if (trackPlayStatus) {
        await fetch("/pauseSong", { method: "POST" });
    } else {
        await fetch("/playSong", { method: "POST" });
    }

    await updateUI();

    if (trackPlayStatus) {
        playPauseIcon.textContent = "play_arrow"; // show play when paused
    } else {
        playPauseIcon.textContent = "pause"; // show pause when playing
    }
});


playNextSong.addEventListener("click", async() => {
    await fetch("/playNextSong", {
        method: "POST"
    })
})

let draggingElement = false;

progressManipulation.addEventListener("pointerdown", () => draggingElement = true);
progressManipulation.addEventListener("pointerup", () => draggingElement = false);
progressManipulation.addEventListener("pointercancel", () => draggingElement = false);


progressManipulation.addEventListener("input", async(e) => {
    const percent = e.target.value;
});

progressManipulation.addEventListener("change", async(e) => {
    const percent = e.target.value;

    const res = await fetch("/currentInfo");
    const data = await res.json();

    const duration = data.item.duration_ms;

    const newTime = Math.floor((percent / 100) * duration);

    await fetch("/seekTime", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            position_ms: newTime
        })
    })

})

async function checkLoginStatus() {
    const res = await fetch("/tokenStatus");
    const data = await res.json();

    const loginButton = document.getElementById("loginButton");
    const songName = document.getElementById("songName")
    const playbackStatus = document.getElementById("playbackStatus");
    const progressContainer = document.getElementById("progressContainer");
    if (data.loginStatus && !window.started) {
        window.started = true;
        startUpdating(); // start ONLY once
    }
    if (!data.loginStatus) {
        window.started = false;
        stopUpdating();
    }

    if (data.loginStatus) {
        loginButton.style.display = "none";
        songName.style.display = "block";
        playbackStatus.style.display = "block";
        progressContainer.style.display = "block";
    } else {
        loginButton.style.display = "block";
        songName.style.display = "none";
        playbackStatus.style.display = "none";
        progressContainer.style.display = "none";
    }
}

checkLoginStatus();
setInterval(checkLoginStatus, 10000)
