const express = require('express');
const router = express.Router();

const spotify = require('./spotify');

router.get('/login', (req, res) => {
    res.redirect(spotify.getLoginURL())
})

router.get('/callback', async(req, res) => {
    const code = req.query.code;

    await spotify.getTokens(code)

    res.redirect('/')
});

router.get('/currentSong', async(req, res) => {
    const currentSong = await spotify.getCurrentSong();

    res.sendStatus(200)
});

router.post('pauseSong', async(req, res) => {
    const songPause = await spotify.pausePlayback

    res.sendStatus(200)
})

router.post('/playSong', async(req, res) => {
    const songPlay = await spotify.playPlayback

    res.sendStatus(200)
})

module.exports = router;