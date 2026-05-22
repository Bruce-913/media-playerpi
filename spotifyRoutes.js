const express = require('express');
const router = express.Router();

const spotify = require('./spotify');

router.get('/login', (req, res) => {
    res.redirect(spotify.getLoginURL());
});

router.get('/callback', async(req, res) => {
    console.log("callback hit!")
    const code = req.query.code;

    console.log("code: ", code);
    const tokenData = await spotify.getTokens(code);
    console.log("token response: ", tokenData);
    res.redirect('/');
});

router.get('/currentInfo', async(req, res) => {
    try{
        const data = await spotify.getCurrentSong();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to get the current song"
        });
    }
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
    };
});

router.put("/seekTime", async(req, res) => {
    const position_ms = req.body.position_ms;


    try {
        await spotify.seekTime(position_ms);
        res.sendStatus(204);
    } catch(err) {
        console.err(err);
        res.sendStatus(500);
    };
});

router.get("/tokenStatus", async(req, res) => {
    const loginStatus = !!spotify.getAccessToken();

    res.json({
        loginStatus
    });
});

module.exports = router;