const express = require('express');
const jwt = require('../jwtAuth.js');
const {addMessage} = require('../db.js');
const { broadcastMessage } = require('../sockets/socket.js');
const router = express.Router();

router.post('/', (req, res) => {
    const username = jwt.verifyJWT(req);
    if (username == 'No token provided' || username == 'Invalid or expired token') {
        return res.status(401).json({success: false, error: username});
    }
    const roomId = req.body.roomId;
    const text = req.body.text;

    try {
        addMessage(roomId, username, text, false);
        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        return res.status(400).json({success: false, error: 'Cannot send message'});
    }
    broadcastMessage(roomId, username, text, null, 1);
})

module.exports = router;