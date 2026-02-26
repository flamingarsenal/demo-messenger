sessionStorage.clear();

const button = document.querySelector('button');
const input = document.querySelector('input');
const err = document.getElementById('errorMessage');

input.focus();

button.addEventListener('click', async () => {
    login();
})

input.addEventListener('keydown', async (e) => {
    if (e.key == 'Enter') {
        login();
    }
})

async function login() {
    let username = input.value.trim().replace(' ', '');

    const response = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: username})
    })

    if (response.ok) {
        data = await response.json();
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        window.location.replace('/chat.html');
    } else {
        const msg = await response.json();
        err.innerText = msg.error;
    }
}