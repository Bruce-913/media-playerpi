const express = require('express');
const router = express.Router();

const spotify = require('./spotify');

router.get('/login', (req, res) => {
    res.redirect(spotify.getLoginURL());
});

router.get('/callback', async(req, res) => {
    const code = req.query.code;

    console.log("code: ", code);
    const tokenData = await spotify.getTokens(code);
    console.log("token response: ", tokenData);
    res.redirect('/');
});

router.get('/currentInfo', async(req, res) => {
    const data = await spotify.getCurrentSong();

    res.json(data);
});

router.post('/pauseSong', async(req, res) => {
    const songPause = await spotify.pausePlayback();

    res.sendStatus(204);
});

router.post('/playSong', async(req, res) => {
    const songPlay = await spotify.playPlayback();

    res.sendStatus(204);
});

router.post('/playPreviousSong', async(req, res) => {
    try {
        await spotify.previousPlay();
        res.sendStatus(204);
    } catch (err) {
        console.err(err)
        res.sendStatus(500)
    }
});

router.post('/playNextSong', async(req, res) => {
    try {
        await spotify.nextPlay();
        res.sendStatus(204);
    } catch (err) {
        console.err(err)
        res.sendStatus(500)
    }
});

module.exports = router;