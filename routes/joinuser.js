const express = require('express');
const dotenv = require ('dotenv');
const jwt = require('../jwtAuth.js');
const db = require('../db.js');
const { notifyAddedUser, broadcastMessage } = require('../sockets/socket.js');
const router = express.Router();

router.post('/', (req, res) => {
  const username = jwt.verifyJWT(req);
  if (username == 'No token provided' || username == 'Invalid or expired token') {
      return res.status(401).json({success: false, error: username});
  }
  const newUser = req.body.newUser;
  const roomId = req.body.roomId;
  const roomName = req.body.roomName;

  try {
    // success
    const added = db.joinUser(username, newUser, roomId);
    res.status(200).json({success: true});
  } catch (e) {
    console.log(e);
    return res.status(400).json({success: false, error: 'Cannot add user to room'});
  }
  notifyAddedUser(newUser, roomName, roomId);

  const global = newUser + ' joined the room';
  db.addMessage(roomId, username, global, true);
  broadcastMessage(roomId, null, global, null, 2);
})

module.exports = router;