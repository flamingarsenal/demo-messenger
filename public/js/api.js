export async function requestNewRoom(newRoomName, token) {
    // send request to backend to verify
    const response = await fetch('/addroom', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({roomName: newRoomName})
    });

    return response;
}

export async function requestNewUser(newUserName, roomId, roomName, token) {
    // send request to backend to verify
    const response = await fetch('/joinuser', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({newUser: newUserName, roomId: roomId, roomName: roomName})
    });

    return response;
}

export async function getUsers(roomId, token) {
    const response = await fetch(`/getusers/${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
    });

    return response;
}

export async function sendMessage(token, roomId, text) {
    const response = await fetch('/sendmessage', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({roomId: roomId, text: text})
    });
    
    return response;
}

export async function getMessages(roomId, token) {
    const response = await fetch(`/getmessages/${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function leaveRoom(roomId, token) {
    const response = await fetch(`/leaveroom/${roomId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })

    return response;
}