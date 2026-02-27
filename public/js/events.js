import { getMessages, getUsers, leaveRoom, requestNewRoom, requestNewUser, sendMessage } from "./api.js";
import { connectWS, setTypingStatus } from "./socket.js";
import { addMessage, addNewRoom, addNewRoomInput, addNewUser, addNewUserInput, clearMsgBar, confirmLeave, displayMessages, displayUsers, getCurrentRoom, getMessage, getNewRoomName, getNewUserName, pageInit, removeError, removeRoom, showError, updateRoomTitle } from "./ui.js";

const username = sessionStorage.getItem('username');
const token = sessionStorage.getItem('token');
const {addroom, adduser, sendMsg, messageBar} = pageInit(username);
let rooms = sessionStorage.getItem('rooms'); // array of strings in format <roomId>.<roomName> stored as a single string
rooms = rooms ? rooms.split(',') : []; // make rooms an empty array if empty otherwise turn into a proper array
let currentRoom = 0; // index, not actual room name

if (rooms.length != 0) {
    let room = rooms[currentRoom].split('.');
    updateUi(room);
}

setRoomEventListeners();

// when the user clicks on the button to add new rooms
addroom.addEventListener('click', () => {
    // prepare the input element to set the new room name
    const newRoomDiv = addNewRoomInput();

    newRoomDiv.addEventListener('keydown', async (event) => {
        // user submits name
        switch (event.key) {
            case 'Enter':
                const newRoomName = getNewRoomName(newRoomDiv);
                const response = await requestNewRoom(newRoomName, token);
            
                const msg = await response.json();
            
                if (response.ok) {
                    rooms.push(msg.roomId+'.'+newRoomName);
                    sessionStorage.setItem('rooms', rooms);
                    // addNewRoom() returns the newly added button to the newly added room
                    // pushing that onto the array of buttons
                    addNewRoom(true, newRoomDiv, newRoomName, addroom); 
                    
                    setRoomEventListeners()
                    currentRoom = rooms.length - 1;

                    let room = rooms[currentRoom].split('.');
                    updateUi(room);
                    break;
                } else {
                    if (msg.error == "Invalid or expired token") {
                        sessionStorage.clear(); 
                        window.location.replace('/');
                    }
                    
                    const errBtn = showError(msg.error);
                
                    errBtn.addEventListener('click', () => {
                        removeError(errBtn);
                        errBtn.removeEventListener('click', () => {})
                    })
                }
            case 'Escape':
                addNewRoom(false, newRoomDiv, null, addroom);
                break;
        }
        })

        // remove the event listener for storage cleanup
        newRoomDiv.removeEventListener('keydown', () => {});
    })

    addroom.removeEventListener('click', () => {});

adduser.addEventListener('click', () => {
    const newUserDiv = addNewUserInput();

    newUserDiv.addEventListener('keydown', async (event) => {
        // user submits name
        switch (event.key) {
            case 'Enter':
                const newUserName = getNewUserName(newUserDiv);
                if (rooms.length == 0) {
                    addNewUser(false, newUserDiv, null, adduser);
                    const errBtn = showError("You are not in any rooms yet");

                    errBtn.addEventListener('click', () => {
                        removeError(errBtn);
                        errBtn.removeEventListener('click', () => {})
                    })
                    break;
                } else {
                    const room = rooms[currentRoom].split('.');
                    const roomId = room[0];
                    const roomName = room[1]
                    const response = await requestNewUser(newUserName, roomId, roomName, token);
                    const msg = await response.json();
                    
                    if (response.ok) {
                        updateUi(room);
                        break;
                    } else {
                        if (msg.error == "Invalid or expired token") {
                            sessionStorage.clear(); 
                            window.location.replace('/');
                        }

                        const errBtn = showError(msg.error);
                    
                        errBtn.addEventListener('click', () => {
                            removeError(errBtn);
                            errBtn.removeEventListener('click', () => {})
                        })
                    }
                }

            case 'Escape':
                addNewUser(false, newUserDiv, null, adduser);
                break;
        }

        // remove the event listener for storage cleanup
        newUserDiv.removeEventListener('keydown', () => {});
    })
})

messageBar.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        message();
        clearMsgBar();
        return;
    } else if (e.key.length == 1) {
        const roomId = rooms[currentRoom].split('.')[0];
        setTypingStatus(token, roomId)
    }
})

sendMsg.addEventListener('click', async () => {
    message();
    clearMsgBar();
})

const ws = connectWS('ws://127.0.0.1:8080/', token, addroom);

export function setRoomEventListeners() {
    const roomsBtns = document.querySelectorAll('.roomName');
    const xBtns = Array.from(document.querySelectorAll('.roomName button'));
    
    // set up event listeners to show the messages and users of a room
    roomsBtns.forEach(button => {
        const buttonHandler = async e => {
            rooms = sessionStorage.getItem('rooms').split(',');
            currentRoom = getCurrentRoom(e.currentTarget, rooms);

            const room = rooms[currentRoom].split('.');
            updateUi(room);
        }

        button.removeEventListener('click', buttonHandler)
        button.addEventListener('click', buttonHandler)
    })

    // set up event listeners for the buttons to leave the rooms
    xBtns.forEach((button, i) => {
        const buttonHandler = event => {
            event.stopPropagation();
            const errBtn = confirmLeave();

            errBtn.addEventListener('click', async e => {
                e.stopPropagation();

                document.body.removeEventListener('click', bodyHandler);
                removeError(errBtn);

                rooms = sessionStorage.getItem('rooms').split(',');
                const roomId = rooms[i].split('.')[0]; // assuming xBtns and the room names are in the same order
                leaveRoom(roomId, token);

                const index1 = rooms.findIndex(room => room.split('.')[0] == roomId);

                rooms.splice(index1, 1);
                sessionStorage.setItem('rooms', rooms);

                const index2 = xBtns.findIndex(btn => btn == button);
                xBtns.splice(index2, 1);

                removeRoom(button.parentElement);

                if (rooms.length) {
                    const room = rooms[0].split('.');
                    if (room) updateUi(room);
                } else {
                    updateRoomTitle('Add a room to get started')
                }
            })

            const bodyHandler = e => {
                e.stopPropagation();

                document.body.removeEventListener('click', bodyHandler);
                removeError(errBtn);
            }

            document.body.addEventListener('click', bodyHandler)
        }

        button.removeEventListener('click', buttonHandler)
        button.addEventListener('click', buttonHandler)
    })
}

export function getCurrentRoomIndex() {
    return currentRoom;
}

export async function updateUi(splitRoom) {
    let res1 = await getUsers(splitRoom[0], token);

    if (res1.ok) {
        const msg = await res1.json();
        displayUsers(username, msg.users, adduser);
    }

    let res2 = await getMessages(splitRoom[0], token);

    if (res2.ok) {
        const msg = await res2.json();
        displayMessages(msg.messages);
    }

    updateRoomTitle(splitRoom[1]);
}

async function message() {
    rooms = sessionStorage.getItem('rooms');
    const text = getMessage();

    if (rooms.length == 0) {
        const errBtn = showError('You are not in any rooms yet');
        console.log(rooms);

        errBtn.addEventListener('click', () => {
            removeError(errBtn);
            errBtn.removeEventListener('click', () => {})
        })
    } else {
        const roomId = rooms[currentRoom].split('.')[0];
        const response = await sendMessage(token, roomId, text);
        const msg = await response.json()

        if (response.ok) {
            addMessage(username, text);
        } else {
            const errBtn = showError(msg.error);
                    
            errBtn.addEventListener('click', () => {
                removeError(errBtn);
                errBtn.removeEventListener('click', () => {})
            })
        }
    }
}
