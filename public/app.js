let trackPlayStatus = false;
let APICallTimeoutId = null;
let APICallInterval = 5000;

let currentProgress = 0
let currentDuration = 0
let progressTimer = null

function updateClock() {
    const clock = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: "2-digit"
    });

    document.getElementById('clockTime').textContent = clock
}

updateClock();
setInterval(updateClock, 1000);

async function startUpdating() {
    if (APICallTimeoutId !== null) return; // already running, bail out

    const run = async () => {
        await updateUI();
        APICallTimeoutId = setTimeout(run, APICallInterval);
    };

    await run();
}

function stopUpdating() {
    clearTimeout(APICallTimeoutId);
    clearInterval(progressTimer);
    APICallTimeoutId = null;
}

async function updateUI() {
    const res = await fetch("/currentInfo");
    const data = await res.json();

    // If rate limited, back off
    if (data && data.rateLimited) {
        const backoff = (data.retryAfter * 1000) + 1000;
        console.warn(`Rate limited, backing off ${backoff}ms`);
        APICallInterval = backoff;
        return;
    }

    if (!data || !data.item) return;

    trackPlayStatus = data.is_playing
    currentProgress = data.progress_ms;
    currentDuration = data.item.duration_ms;

    const songDuration = data.item.duration_ms

    const songDurationMinutes = Math.floor((songDuration * 0.001) / 60);
    const remainderDurationSeconds = Math.floor(((songDuration * 0.001) % 60));
    const formattedSongDur = `${songDurationMinutes}:${remainderDurationSeconds.toString().padStart(2, "0")}`;

    document.getElementById("songLength").innerText = formattedSongDur

    document.getElementById("songName").innerText =
        data.item.name;

    document.getElementById("artistName").innerText =
        data.item.artists[0].name;

    document.getElementById("albumArt").src =
        data.item.album.images[0].url;

    startProgressBarAnimation();
};


function startProgressBarAnimation() {
    clearInterval(progressTimer);

    if (!trackPlayStatus) return;

    progressTimer = setInterval(() => {
        currentProgress += 1000;

        const percent = (currentProgress / currentDuration) * 100;

        if (!draggingElement) {
            document.getElementById("progressBar").value = percent;
        }

        const songMinutes = Math.floor((currentProgress * 0.001) / 60);
        const remainderSeconds = Math.floor((currentProgress * 0.001) % 60);

        document.getElementById("currentTime").innerText = `${songMinutes}:${remainderSeconds.toString().padStart(2, "0")}`

        if (currentProgress >= currentDuration) {
            clearInterval(progressTimer);
        }
    }, 1000);
}

// setInterval(updateUI, 10000);

const playPreviousSong = document.getElementById('prevButton')
const playNextSong = document.getElementById('nextButton')
const playPauseButton = document.getElementById('playPauseButton')
const playPauseicon = document.getElementById("playPauseIcon")

const progressManipulation = document.getElementById('progressBar')

playPreviousSong.addEventListener("click", async () => {
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


playNextSong.addEventListener("click", async () => {
    await fetch("/playNextSong", {
        method: "POST"
    })
})

let draggingElement = false;

progressManipulation.addEventListener("pointerdown", () => draggingElement = true);
progressManipulation.addEventListener("pointerup", () => draggingElement = false);
progressManipulation.addEventListener("pointercancel", () => draggingElement = false);


progressManipulation.addEventListener("input", async (e) => {
    const percent = e.target.value;
});

progressManipulation.addEventListener("change", async (e) => {
    const percent = e.target.value;

    const newTime = Math.floor((percent / 100) * currentDuration);

    currentProgress = newTime;
    document.getElementById("progressBar").value = percent;

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
