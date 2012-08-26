var application_root = __dirname,
	userdb 			= require("./userdb"),
	express 		= require("express"),
	path 			= require("path"),
	passport 		= require("passport"),
	LocalStrategy 		= require('passport-local').Strategy;

var app 		= express();
var UserDb 		= new userdb.UserDB();
UserDb.connect();

// Config.
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser("SOMESECRET"));
	app.use(express.session({
		secret: "SOMESECRET",
      	}));
	app.use(passport.initialize());
	app.use(passport.session());	
	app.use(app.router);
	app.use(express.static(path.join(application_root, "../Frontend")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


// Passport config.
passport.use(new LocalStrategy(
	function(username, hash, done) {	
		UserDb.lookupUser(username, hash, function(err, user) {
			if(!user)
				done("User not found.", null);
			else
				done(null, user);
		});
	})
);

passport.serializeUser(function(user, done) {
	UserDb.createSession(user, function(err, sid) {
		done(null, sid);
	});
});

passport.deserializeUser(function(sid, done) {
	UserDb.lookupSession(sid, function(err, user) {
		if(!user)
			done("Session not found.", null);
		else
			done(null, user);
	});
});

// API.
app.get('/loginfailed', function (req, res) {
	res.send("Login failed.");
});

app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/loginfailed' }),
	function (req, res) {
		res.redirect('/home');	
	});

app.get('/home',
	function (req, res) {
		// req.user is set if session is established!
		if(!req.user)
			res.send("Not authenticated.");
		else		
			res.send("Home.");	
	});

// Launch server
app.listen(4242);
