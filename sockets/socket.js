const db = require('../db.js');
const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const wss = new WebSocketServer({ port: 8080 });

let sockets = new Map();
function listenWS() {
    wss.on('connection', (ws) => {
        ws.on('message', (data) => {
            let msg = JSON.parse(data);
            switch (msg.type) {
                case 'register':
                    console.log('socket.js, line 14: ' + msg.token);
                    try {
                        const username = jwt.verify(msg.token, process.env.JWT_SECRET_KEY).sub;
                        ws.username = username;
                        sockets.set(username, ws);
                        console.log('socket.js, line 19: ');
                        console.log(sockets);
                    } catch (e) {
                        console.log('socket.js, line 21: ' + e);
                    }
                    break;
                case 'typingStatus':
                    try {
                        const username = jwt.verify(msg.token, process.env.JWT_SECRET_KEY).sub;
                        broadcastMessage(msg.roomId, username, null, msg.status, 3);
                    } catch (e) {
                        console.log('socket.js, line 29: ' + e);
                        console.log(token);
                    }
                    break;
            }
        })

        ws.on('close', () => {
            const username = ws.username;
            if (!username) return;
            console.log('socket.js, line 39: ' + username);
            console.log(ws);
            sockets.delete(username);
            const timer = setTimeout(() => {
                try {
                    if (!sockets.get(username)) {
                        db.removeUser(username);
                        console.log('socket.js, line 46 : ' + username + ' has been deleted');
                    }
                } catch (e) {
                    console.log('socket.js, line 49: \n' + e);
                }

            }, 10 * 1000)
        })
    })

    setInterval(() => {
        sockets.forEach((ws) => {
            ws.send(0);
        })
    }, 20000);
}

function notifyAddedUser(newUser, roomName, roomId) {
    const ws = sockets.get(newUser);

    const msg = JSON.stringify({
        action: 'joinRoom',
        roomName: roomName,
        roomId: roomId
    })

    if (ws) {
        ws.send(msg);
    } else {
        console.log('socket.js, line 74: ' + newUser);
        console.log(sockets);
    }
}

// type- 1=message, 2=globalMessage, 3=typingStatus
// username is not for global message, status is only for typing status, text is not for typing status
function broadcastMessage(roomId, username, text, status, type) {
    let msg;
    let users;

    switch (type) {
        case 1:
            users = db.getUsers(username, roomId);
            msg = JSON.stringify({
                action: 'message',
                username: username,
                roomId: roomId,
                text: text
            })
            break;
        case 2:
            users = db.getUsers(null, roomId);
            msg = JSON.stringify({
                action: 'globalMessage',
                roomId: roomId,
                text: text
            })
            break;
        case 3:
            users = db.getUsers(username, roomId);
            msg = JSON.stringify({
                action: 'typingStatus',
                roomId: roomId,
                username: username,
                status: status
            })
            break;
    }

    users.forEach((user) => {
        const ws = sockets.get(user);

        if (ws) ws.send(msg);
    })
}

function userLeave(username, roomId) {
    const users = db.getUsers(username, roomId);

    const msg = JSON.stringify({
        action: 'userLeave',
        roomId: roomId,
        username: username
    })

    users.forEach(user => {
        const ws = sockets.get(user);

        if (ws) ws.send(msg);
    })
}

function broadcastAddedUser(username, newUser, roomId) {
    const users = db.getUsers(username, roomId);

    const msg = JSON.stringify({
        action: 'userJoin',
        roomId: roomId,
        username: newUser
    })

    users.forEach(user => {
        const ws = sockets.get(user);

        if (ws) ws.send(msg);
    })
}

module.exports = { listenWS, notifyAddedUser, broadcastMessage, userLeave, broadcastAddedUser };