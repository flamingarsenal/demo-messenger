const express = require('express');
const jwt = require('../jwtAuth.js');
const {getMessagesByRoom} = require('../db.js');
const router = express.Router();

router.get('/:roomId', (req, res) => {
    const username = jwt.verifyJWT(req);
    if (username == 'No token provided' || username == 'Invalid or expired token') {
        return res.status(401).json({success: false, error: username});
    }
    try {
        const messages = getMessagesByRoom(req.params.roomId);
        return res.status(200).json({success: true, messages: messages});
    } catch (e) {
        console.log(e);
        return res.status(404).json({success: false, error: 'Cannot get messages'});
    }
})

module.exports = router;