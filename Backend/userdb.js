var mongojs = require('mongojs');

function UserDB() {

	this.connection = null; 

	// Verbindungsaufbau zu MongoDB
	this.connect = function(){
		this.connection = mongojs.connect('userDB', ['users', 'sessions']);
		console.log("Connected to database server.")
	};

	// Userdaten/password -> user zurückgeben und Fehlermeldung (0)
	this.lookupUser = function(email, password, done){
		this.connection.users.find({email: email, password: password}, function(err, users){
			if ( err || !users || (users.length == 0)) {
				console.log("User does not exist or wrong password: " + err);
				done(err, null);
			} else {
				// TODO ...
				var user = users[0];
    				done(null, user);
  			}
		});
	};

	// Fügt einen Benutzer zur DB hinzu
	this.addUser =  function(email, password, done){
		this.connection.users.save({"email": email, "password": password}, function(err, saved){
			if ( err || !saved ) { 
				console.log("User not saved.");
				done(err);
			} else {
				console.log("User saved.");
				done(null);
			}
		});
	}

	this.lookupSession = function(sessionid, done) {
		this.connection.sessions.find({"sessionid": sessionid}, function(err, sessions){
			if (err || !sessions || (sessions.length == 0)) {
				console.log("Session not found.");
				done(err, null);
			} else {
				// TODO ...
				var session = sessions[0];
  				done(null, session);
			}
		});

	};

	this.createSession = function(user, done) {
		// TODO: Create truly random session id + timestamp.
		var sessionid = (new Date()).getDate();
		this.connection.sessions.save({"sessionid": sessionid, "userid": user.id, "email": user.email}, function(err, saved){
			if( err || !saved ) {
				done("Session not saved.", null);
			}
  			else {	
				done(null, sessionid);
			}
		});
	}
};

module.exports.UserDB = UserDB;
