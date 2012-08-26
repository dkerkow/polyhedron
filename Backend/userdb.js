var mongojs = require('mongojs');
var crypto  = require('crypto');

// Creates a SHA1 hash of data and returns its base64 representation.
function _hash(data) {
	return crypto.createHash("sha1").update(data).digest("base64");
}

function UserDB(configuration) {

	this._connection = null; 
	this._configuration = configuration;

	this.connect = function(){
		this._connection = mongojs.connect('userDB', ['users', 'sessions']);
		if(!this._connection) {
			console.log("Could not connect to database server.");
			return false;

		} else {
			console.log("Connected to database server.");
			return true;
		}
	};

	// Find user by email and verify password (hash).
	// NOTE: Never tell the user which of username or password was incorrect.
	this.lookupUser = function(email, password, done) {
		this._connection.users.find({"email": email}, function(err, users) {
			if ( err || !users || (users.length == 0)) {
				done("User not found or incorrect password.", null);
			} else {
				// TODO: make email UNIQUE in database.
				var user = users[0];

				var hash = _hash(email + password + user.salt);
				if(user.hash == hash)
					done(null, user);
				else
					done("User not found or incorrect password.", null);
  			}
		});
	};

	// Add user to database with salted email+password hash.
	this.addUser =  function(name, email, password, done){
		var con = this._connection;

		crypto.randomBytes(256, function(ex, salt) {
			if (ex) 
				done(err);

			var hash = _hash(email + password + salt);
			con.users.save({"name": name, "email": email, "hash": hash, "salt": salt}, function(err, saved){
				if ( err || !saved )
					done(false);
				else
					done(true);
			});
		});
	};

	// Find session by sessionid and verify that it has not expired.
	// If it is valid, update timestamp.
	this.lookupSession = function(sessionid, done) {
		var con = this._connection;
		var max_session_age = this._configuration.MAX_SESSION_AGE;

		con.sessions.find({"sessionid": sessionid}, function(err, sessions){
			if (err || !sessions || (sessions.length == 0))
				done("Invalid session id.", null);
			else {
				// TODO: Make sessionid UNIQUE in database.
				var session = sessions[0];

				var now = new Date().getTime();
				if((now - session.ts) > max_session_age) {
					con.sessions.remove({"sessionid": session.sessionid}, function(err, removed) {
						if ( err || !removed ) { 
							console.log("Could not remove session from database!");
						}
					});
					done("Session has expired.", null);
				} else {
					session.ts = now;
					con.sessions.update({"_id": session._id}, session, false, function(err, updated) {
						if ( err || !updated ) { 
							console.log("Could not update session timestamp in database!");
						}
					});
					done(null, session);
				}
  					
			}
		});
	};

	// Create a new session with a unique sessionid.
	this.createSession = function(user, done) {
		var con = this._connection;

		crypto.randomBytes(256, function(ex, entropy) {
			if (ex) 
				done(err);

			var session = {
				"sessionid": _hash(entropy), 
				"email": user.email, 
				"ts": new Date().getTime()
			}

			con.sessions.save(session, function(err, saved) {
				if( err || !saved ) {
					done("Could not establish session.", null);
				}
	  			else {	
					done(null, session.sessionid);
				}
			});
		});
	};
};

module.exports.UserDB = UserDB;
