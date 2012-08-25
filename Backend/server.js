var application_root = __dirname,
	express = require("express"),
	path = require("path"),
	passport = require("passport"),
	LocalStrategy = require('passport-local').Strategy;
var app = express();

// Config.
app.configure(function () {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(passport.initialize());
	app.use(app.router);
	app.use(express.static(path.join(application_root, "../Frontend")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Passport config.
passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log(username);
		console.log(password);
		done(null, "test");
	})
);

// API.
app.get('/loginfailed', function (req, res) {
	res.send("Login failed.");
});

app.get('/login', 
	passport.authenticate('local', { failureRedirect: '/loginfailed' }),
	function (req, res) {
		res.redirect('/loginfailed');	
	});

// Launch server
app.listen(4242);
