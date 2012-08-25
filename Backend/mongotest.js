var userDB = {

	this.connection; 

	// Verbindungsaufbau zu MongoDB
	connect: function(){
		var db = require('mongojs').connect('userDB', ['users']);
		console.log("Connected to database server.")

	},

	// Userdaten/password -> user zurückgeben und Fehlermeldung (0)
	lookup: function(email, password){
		this.connection.users.find({email: email, password: password}, function(err, users){
			if( err || !users) {
				console.log("User does not exist or wrong password.");
				return 0;
			}
  			else {
  				users.forEach( function(user) {
    				console.log(user);
    				return user;
  				});
  			}
		});

	},

	// Fügt einen Benutz zur DB hinzu
	addUser: function(email, password){
		this.connection.users.save({"email":eamil, "password:": password}, function(err, saved){
			if( err || !saved ) console.log("User not saved");
  			else console.log("User saved");
		});
	}
}