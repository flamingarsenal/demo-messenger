const express = require('express');
const jwt = require('../jwtAuth.js');
const {leaveRoom, addMessage} = require('../db.js');
const { userLeave, broadcastMessage } = require('../sockets/socket.js');
const router = express.Router();

router.delete('/:roomId', (req, res) => {
    const username = jwt.verifyJWT(req);
    if (username == 'No token provided' || username == 'Invalid or expired token') {
        return res.status(401).json({success: false, error: username});
    }
    try {
        // leaveRoom returns true if the room still has members hence the room exists or false otherwise
        if (leaveRoom(req.params.roomId, username)) {
            userLeave(username, req.params.roomId)
            addMessage(req.params.roomId, username, username + ' left', true);
            broadcastMessage(req.params.roomId, username, username + ' left', null, 2);
            return res.status(200).json({success: true});
        }
    } catch (e) {
        console.log(e);
        return res.status(404).json({success: false, error: 'How do you mess up while LEAVING a room'});
    }
})

module.exports = router;