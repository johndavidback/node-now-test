var fs = require('fs');

var port = 1340;

var httpServer = require('http').createServer(function(request, response) {
	
	console.log('request incoming...');

	fs.readFile('./index.html', function(error, content){
		if(error) {
			response.writeHead(500);
			response.end();
		} else {
			response.writeHead(200, {'Content-Type': 'text/html'} );
			response.end(content, 'utf-8');
		}

	});

});

httpServer.listen(port, '10.4.16.104');
console.log('Listening on: ' + port);

var nowjs = require("now");
var everyone = nowjs.initialize(httpServer);

var chat_group = nowjs.getGroup('chat-group');

// var everyone = nowjs.initialize(server);

everyone.now.distributeMessage = function(msg) {
	everyone.now.receiveMessage(this.now.name, this.user.clientId, msg);
	console.log("Incoming message [" + this.user.clientId + "]: " + msg);
};

everyone.now.directMessage = function(id, msg) {
	console.log('Attempting to send direct to ' + id + '(' + msg + ')');
	var from_user = this.now.name;
	var message = msg;
	var user_id = this.user.clientId;

	nowjs.getClient(id, function() {
		console.log('Found user ' + this.now.name);
		this.now.receiveMessage('Direct From: ' + from_user, user_id, message);
	});
};

everyone.now.logStuff = function(msg) {
	console.log("Log stuff: " + msg);
	//everyone.now.receiveMessage('server', 'Someone new has joined');
};

nowjs.on('connect', function() {
	console.log('Adding ' + this.now.name + ' to user lists.');		

	chat_group.getUsers(function(users) {
		for(var i = 0; i < users.length; i++) {
			//this.now.addUserToList('the name', users[i]);
		}
	});

	chat_group.addUser(this.user.clientId);
	chat_group.now.addUserToList(this.now.name, this.user.clientId);

	var client_id = this.user.clientId;
	var name = this.now.name;
	console.log('User ' + name + ' with id ' + client_id + ' is now online');

});

nowjs.on('disconnect', function() {
	var client_id = this.user.clientId;
	var name = this.now.name;

	console.log('User ' + name + ' with id ' + client_id + ' is now offline');

	everyone.now.removeUserFromList(client_id);
});

