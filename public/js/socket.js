import { setRoomEventListeners, getCurrentRoomIndex, updateUi } from "./events.js";
import { addMessage, addNewRoom, addNewUser, addUser, removeUser, showTypingStatus } from "./ui.js";

let rooms = sessionStorage.getItem('rooms');
rooms = rooms ? rooms.split(',') : [];
let ws;
let timer;
let typingStatus = false;
let statuses = [];

export function connectWS(url, token, addroom) {
    ws = new WebSocket(url);
    
    ws.addEventListener('open', () => {
        const msg = JSON.stringify({
            token: token,
            type: 'register',   
        })
        console.log('Connected');
        ws.send(msg);

        ws.addEventListener('message', (e) => {
            const msg = JSON.parse(e.data);
            switch (msg.action) {
                case 'joinRoom':
                    addNewRoom(true, null, msg.roomName, addroom); 
                    setRoomEventListeners();
                    updateUi([msg.roomId, msg.roomName]);

                    let room = msg.roomId+'.'+msg.roomName;
                    rooms.push(room);
                    sessionStorage.setItem('rooms', rooms);
                    break;
                case 'message':
                case 'globalMessage':
                    rooms = sessionStorage.getItem('rooms');
                    if (rooms[getCurrentRoomIndex()].split('.')[0] == msg.roomId) {
                        addMessage(msg.username, msg.text, msg.action == 'globalMessage');
                    }
                    break;
                case 'typingStatus':
                    const roomId = msg.roomId;
                    const username = msg.username;
                    if (msg.status) {
                        statuses.push({roomId, username});
                    } else {
                        const index = statuses.findIndex(status => status.username == username && status.roomId == roomId);

                        if (index > -1) statuses.splice(index, 1);
                    }

                    const currentRoomStatuses = statuses.filter(status => status.roomId != rooms[getCurrentRoomIndex()].split('.')[0]);

                    showTypingStatus(currentRoomStatuses.map(status => status.username));
                    break;
                case 'userLeave':
                    rooms = sessionStorage.getItem('rooms');
                    if (rooms[getCurrentRoomIndex()].split('.')[0] == msg.roomId) {
                        removeUser(msg.username);
                    }
                    break;
                case 'userJoin':
                    rooms = sessionStorage.getItem('rooms');
                    if (rooms[getCurrentRoomIndex()].split('.')[0] == msg.roomId) {
                        addUser(msg.username);
                    }
                    break;
            }
        })
    })

    ws.addEventListener('close', () => {
        ws = new WebSocket(url);
    })

    return ws;
}

export function setTypingStatus(token, roomId) {
    if (timer) clearTimeout(timer);

    
    if (!typingStatus) {
        const msg = JSON.stringify({
            token: token,
            roomId: roomId,
            type: 'typingStatus',
            status: true
        })

        ws.send(msg);
        typingStatus = true;
    }

    timer = typingStatusTimeout(token, roomId);
}

function typingStatusTimeout(token, roomId) {
    return setTimeout(() => {
        const msg = JSON.stringify({
            token: token,
            roomId: roomId,
            type: 'typingStatus',
            status: false
        })
        if (typingStatus) {
            ws.send(msg);
            typingStatus = false;
            clearTimeout(timer);
        }
    }, 5000);
}