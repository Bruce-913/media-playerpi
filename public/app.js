async function updateUI() {
  const res = await fetch("/currentInfo");
  const data = await res.json();

  if (!data || !data.item) return;

  trackPlayStatus = data.is_playing

  document.getElementById("songName").innerText =
    data.item.name;

  document.getElementById("artistName").innerText =
    data.item.artists[0].name;

  document.getElementById("albumArt").src =
    data.item.album.images[0].url;
};

setInterval(updateUI, 500);

const playPreviousSong = document.getElementById('prevButton')
const playNextSong = document.getElementById('nextButton')
const playPauseButton = document.getElementById('playPauseButton')

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
let trackPlayStatus = false;

playPauseButton.addEventListener("click", async () => {
    if (trackPlayStatus) {
        await fetch("/pauseSong", { method: "POST" });
    } else {
        await fetch("/playSong", { method: "POST" });
    }

    await updateUI();
});

playNextSong.addEventListener("click", async() => {
    await fetch("/playNextSong", {
        method: "POST"
    })
})

updateUI();