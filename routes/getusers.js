const express = require('express');
const jwt = require('../jwtAuth.js');
const {getUsers} = require('../db.js');
const router = express.Router();

router.get('/:roomId', (req, res) => {
    const username = jwt.verifyJWT(req);
    if (username == 'No token provided' || username == 'Invalid or expired token') {
        return res.status(401).json({success: false, error: username});
    }
    try {
        const users = getUsers(username, parseInt(req.params.roomId));
        return res.status(200).json({success: true, users: users});
    } catch (e) {
        console.log(e);
        return res.status(404).json({success: false, error: 'Cannot get users'});
    }
})

module.exports = router;