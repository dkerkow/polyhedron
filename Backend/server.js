var application_root = __dirname,
	userdb 			= require("./userdb"),
	express 		= require("express"),
	path 			= require("path"),
	passport 		= require("passport"),
	LocalStrategy 		= require('passport-local').Strategy;

// Global constants.
var config = {
	// Maximum age of session in ms.
	MAX_SESSION_AGE: 300000
};

// User database initialization.
var UserDb 		= new userdb.UserDB(config);
if(!UserDb.connect()) return;

// Express config.
var app 		= express();
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser("503a3d9f7244655510000001"));
	app.use(express.session({secret: "503a3d9f7244655510000001"}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "../Frontend")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Passport config.
passport.use(new LocalStrategy(
	function(username, password, done) {	
		UserDb.lookupUser(username, password, done);
	})
);

passport.serializeUser(function(user, done) {
	UserDb.createSession(user, done);
});

passport.deserializeUser(function(sid, done) {
	UserDb.lookupSession(sid, done);
});

// Express API.
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

app.post('/register',
	function (req, res) {
		UserDb.addUser(req.body.username, req.body.email, req.body.password, function(success) {
			if(!success) {
				res.send("Failed to register.");
			} else {
				res.redirect("/index.html");
			}
		});
	});

// Launch server
app.listen(4242);
