var express = require('express');
var app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var path = require('path');
var chatRouter = require('./routes/chat');




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/emoji', express.static(__dirname + '/node_modules/emojionearea/dist/'));

var usernames = [];
var avatars=[];


server.listen(3000);

app.use('/', chatRouter);

io.on('connection',function(socket){
	socket.on('send message',function(data){
		//broadcast to all users
		io.sockets.emit('new message', {msg: data, user:socket.username, avatar:socket.avatar});
	});

	socket.on('new user', function(data,callback){
		if (usernames.indexOf(data) != -1){
				callback(false)
		}else{
			callback(true)
		  socket.username = data.user;
			socket.avatar= data.avatar;
		  usernames.push(socket.username);
			avatars.push(socket.avatar);
		  updateUsernames();
		}
	});

// update usernames array
function updateUsernames(){
		io.sockets.emit('usernames', {usernames:usernames, avatars:avatars});
}

socket.on('typing', function(data){
	//everyone except the user
	socket.broadcast.emit('typing', data);
})

socket.on('not typing', function(data){
	//everyone except the user
	socket.broadcast.emit('not typing', data);
})


	socket.on('disconnect', function(data){
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		avatars.splice(avatars.indexOf(socket.avatar), 1);
		updateUsernames();
	})
});
