const divs = document.querySelectorAll('body div');
const body = document.querySelector('body');

export function pageInit(username) {
    document.title = 'Lightweight Messenger - ' + username;

    // get the sidebar showing all the rooms and cycle through all the room names stored in session storage and add them in
    const addroom = document.getElementById('addroom');
    const adduser = document.getElementById('adduser');
    const roomsSidebar = document.getElementById('rooms-sidebar');
    const roomTitle = document.querySelector('.chat-titlebar');
    const sendMsg = document.querySelector('.chat-input button');
    const messageBar = document.querySelector('.chat-input input')
    let rooms = sessionStorage.getItem('rooms');
    rooms = rooms ? rooms.split(',') : [];

    if (rooms.length == 0) {
        roomTitle.innerText = 'Start by adding a room';
    } else {
        roomTitle.innerText = rooms[0].split('.')[1];
    }
    
    const fragment = document.createDocumentFragment();
    rooms.forEach((room) => {
        const roomDiv = document.createElement('div');
        const xBtn = document.createElement('button');

        xBtn.innerText = 'X';

        roomDiv.className = 'room roomName';
        roomDiv.id = room.split('.')[1];
        roomDiv.innerText = room.toString().split('.')[1];

        roomDiv.appendChild(xBtn);
        fragment.appendChild(roomDiv);
    })

    roomsSidebar.appendChild(fragment);
    // lastly add the button to add new rooms
    roomsSidebar.appendChild(addroom);

    return {addroom, adduser, sendMsg, messageBar};
}

export function addNewRoomInput() {
    const addroom = document.getElementById('addroom');
    const roomsSidebar = document.getElementById('rooms-sidebar');

    // prepare the input element to set the new room name
    const newRoomDiv = document.createElement('div')
    const newRoomInput = newRoomDiv.appendChild(document.createElement('input'));
    
    newRoomDiv.className = 'room'
    newRoomInput.placeholder = 'New Room Name';
    
    // remove the button and show the new input element
    roomsSidebar.removeChild(addroom);
    roomsSidebar.appendChild(newRoomDiv);
    newRoomInput.focus();

    return newRoomDiv;
}

export function addNewRoom(isValid, newRoomDiv, newRoomName, addroom) {
    const roomsSidebar = document.getElementById('rooms-sidebar');
    const xBtn = document.createElement('button');
    
    if (isValid) {
        const newRoom = document.createElement('div');

        xBtn.innerText = 'X';

        newRoom.innerText = newRoomName;
        newRoom.className = 'room roomName';
        newRoom.id = newRoomName;

        newRoom.appendChild(xBtn);
        roomsSidebar.appendChild(newRoom);
    }
    
    if (newRoomDiv) {
        roomsSidebar.removeChild(newRoomDiv);
    }
    
    roomsSidebar.appendChild(addroom);
    return xBtn;
}

export function getNewRoomName(newRoomDiv) {
    const newRoomName = newRoomDiv.querySelector('input').value;
    
    return newRoomName;
}

export function addNewUserInput() {
    const membersSidebar = document.getElementById('members-sidebar');
    const adduser = document.getElementById('adduser');

    const newUserDiv = document.createElement('div');
    const newUserInput = newUserDiv.appendChild(document.createElement('input'));
    
    newUserDiv.className = 'member';
    newUserInput.placeholder = 'Enter Username';

    membersSidebar.removeChild(adduser);
    membersSidebar.appendChild(newUserDiv);
    newUserInput.focus();

    return newUserDiv;
}

export function addUser(username) {
    const adduser = document.getElementById('adduser');
    const membersSidebar = document.getElementById('members-sidebar');
    const newUser = document.createElement('div');

    newUser.innerText = username;
    newUser.className = 'member memberName';
    newUser.id = username;

    membersSidebar.appendChild(newUser);
    if (adduser) membersSidebar.appendChild(adduser);
}

export function addNewUser(isValid, newUserDiv, newUserName, adduser) {
    const membersSidebar = document.getElementById('members-sidebar');
    
    if (isValid) {
        addUser(newUserName);
    }
    
    membersSidebar.removeChild(newUserDiv);
    membersSidebar.appendChild(adduser);
}

export function getNewUserName(newUserDiv) {
    const newUserName = newUserDiv.querySelector('input').value;
    
    return newUserName;
}

export function showError(error) {
    const errDiv = document.createElement('div');
    const errMsg = errDiv.appendChild(document.createElement('p'));
    const errBtn = errDiv.appendChild(document.createElement('button'));

    errMsg.innerText = error;
    errBtn.innerText = 'OK';
    errDiv.id = 'error';

    divs.forEach((element, _) => {
        element.style.pointerEvents = 'none';
    })

    body.appendChild(errDiv);

    return errBtn;
}

export function confirmLeave() {
    const errDiv = document.createElement('div');
    const errMsg = errDiv.appendChild(document.createElement('p'));
    const errBtn = errDiv.appendChild(document.createElement('button'));

    errMsg.innerText = 'Are you sure you want to leave this room?';
    errBtn.innerText = 'Yes';
    errDiv.id = 'error';

    divs.forEach((element, _) => {
        element.style.pointerEvents = 'none';
    })

    body.appendChild(errDiv);

    return errBtn;
}

export function removeError(errBtn) {
    body.removeChild(errBtn.parentElement);

    divs.forEach((element, _) => {
        element.style.pointerEvents = 'auto';
    })
}

export function getCurrentRoom(clickedRoom, rooms) {
    const roomTitle = document.querySelector('.chat-titlebar');
    const room = clickedRoom ? clickedRoom.innerText.replace('X', '').trim() : null; // this reomves the text from the leave button included in innertext

    let currentRoom = rooms.findIndex(element => element.split('.')[1] === room);
    if (currentRoom == -1) {
        console.log('cant find room' + room);
        currentRoom = 0;
    } else {
        roomTitle.textContent = room;
    }
    return currentRoom;
}

export function displayUsers(username, users, adduser) {
    const membersSidebar = document.getElementById('members-sidebar');
    const membersHeader = document.querySelector('#members-sidebar h2');
    if (!adduser) adduser = document.getElementById('adduser');

    const userDiv = document.createElement('div');

    userDiv.className = 'member memberName';
    userDiv.innerText = username + ' (You)';

    const divs = [];
    users.forEach(username => {
        const userDiv = document.createElement('div');
        userDiv.innerText = username;
        userDiv.className = 'member memberName';
        userDiv.id = username;

        divs.push(userDiv);
    })

    membersSidebar.replaceChildren(membersHeader, userDiv, ...divs, adduser);
}

export function getMessage() {
    const messageBar = document.querySelector('.chat-input input');
    const text = messageBar.value;
    if (text.trim().replace(' ', '') != '') {
        messageBar.value = null;
        return text;
    };
}

export function addMessage(username, text, isGlobal) {
    const chatMessages = document.querySelector('.chat-messages');
    const msgP = document.createElement('p');

    if (isGlobal) {
        msgP.className = 'global';
        msgP.innerText = text;
    } else {
        msgP.innerText = username + ': ' + text;
    }

    chatMessages.appendChild(msgP);
}

export function displayMessages(messages) {
    const chatMessages = document.querySelector('.chat-messages');

    const msgs = [];
    messages.forEach(({username, text, isGlobal}) => {
        const msgP = document.createElement('p');

        if (isGlobal) {
            msgP.className = 'global';
            msgP.innerText = text;
        } else {
            msgP.innerText = username + ': ' + text;
        }

        msgs.push(msgP);
    })

    chatMessages.replaceChildren(...msgs);
}

export function updateRoomTitle(title) {
    document.querySelector('.chat-titlebar').innerText = title;
}

export function showTypingStatus(usernames) {
    const chatMessages = document.querySelector('.chat-messages');
    let statusP = document.querySelector('.chat-messages #statuses');
    console.log(usernames);
    
    if (!usernames.length && statusP) {
        chatMessages.removeChild(statusP);
        return;       
    } else if (usernames.length && !statusP) {
        statusP = document.createElement('p');
        statusP.id = 'statuses';
    }

    const v = usernames.length > 1 ? ' are' : ' is';
    usernames = usernames.length < 3 ? usernames.join(', ') : 'Multiple users';

    statusP.innerText = usernames + v + ' typing...';

    chatMessages.appendChild(statusP);
}

export function removeRoom(roomDiv) {
    document.querySelector('#rooms-sidebar').removeChild(roomDiv);

    const membersSidebar = document.querySelector('#members-sidebar');
    membersSidebar.replaceChildren(membersSidebar.firstChild);
}

export function removeUser(username) {
    document.querySelector('#members-sidebar').removeChild(document.getElementById(username));
}

export function updateUnread(roomName, unreadCount) {
    if (unreadCount > 0) {
        document.getElementById(roomName).innerText = roomName + ' (' + unreadCount + ')';
    } else {
        document.getElementById(roomName).innerText = roomName
    }
}

export function clearMsgBar() {
    document.querySelector('.chat-input input').value = '';
}