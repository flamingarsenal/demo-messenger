const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const wss = require('./sockets/socket.js');
const app = express();
const port = 3000;
const server = http.createServer(app);

dotenv.config();

server.listen(port, () => {});

app.use(express.json());
app.use(express.static('public'));

app.use('/login', require('./routes/login.js'));

app.use('/addroom', require('./routes/addroom.js'));

app.use('/joinuser', require('./routes/joinuser.js'));

app.use('/getusers', require('./routes/getusers.js'));

app.use('/sendmessage', require('./routes/sendmessage.js'));

app.use('/getmessages', require('./routes/getmessages.js'));

app.use('/leaveroom', require('./routes/leaveroom.js'));

wss.listenWS();

