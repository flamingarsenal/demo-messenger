const express = require('express');
const dotenv = require ('dotenv');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const router = express.Router();

router.post('/', (req, res) => {
  const response = generateTokenResponse(req.body.username);
  try {
    db.createUser(req.body.username);
    res.status(200).json(response);
    timer = setTimeout(() => {
      if (db.getIdFromUsername(req.body.username)) {
        db.removeUser(req.body.username);
      }
    }, 1000 * 60 * 60); // set a timer to automatically remove the user after one hour, assuming the user still exists
  } catch (e) {
    console.log(e);
    res.status(400).json({error: 'Username not available'});
  }
});

function generateTokenResponse(username) {
  let jwtsercretkey = process.env.JWT_SECRET_KEY;
  const exp = Math.floor(Date.now() / 1000) + (60 * 60); // set expiry for an hour

  let data = {
    sub: username,
    exp: exp
  }

  const token = jwt.sign(data, jwtsercretkey);

  const response = {
    username: username,
    token: token
  }

  return response;
}

module.exports = router;