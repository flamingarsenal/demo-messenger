const express = require('express');
const dotenv = require ('dotenv');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const router = express.Router();

router.post('/', (req, res) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({success: false, error: "No token provided"});

    const token = authHeader.replace("Bearer ", "").trim();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const username = decoded.sub;
        const roomName = req.body.roomName;
        
        try {
            // no name provided
            if (roomName == '') throw new Error('Empty room name');
            // success
            const roomId = db.createRoom(roomName, username);
            res.status(200).json({success: true, roomname: roomName, roomId: roomId});
        } catch (e) {
            // none unique room name
            console.log(e);
            res.status(400).json({success: false, error: "Invalid room name"});
        }
    } catch (e) {
        //token error
        console.log(e);
        res.status(401).json({success: false, error: "Invalid or expired token"});
    }
});

module.exports = router;