var     application_root	= __dirname,
		userdb 				= require("./modules/userdb"),
		express 			= require("express"),
		path 				= require("path"),
		passport 			= require("passport"),
		LocalStrategy 		= require('passport-local').Strategy;

// Global constants.
var config = {
	// Maximum age of session in ms.
	MAX_SESSION_AGE: 300000,
	COOKIE_SECRET: "503a3d9f7244655510000001",
	HTTP_PORT: 4242
};

// User database initialization.
var UserDb 		= new userdb.UserDB(config);
if(!UserDb.connect()) return;

// Express config.
var app 		= express();
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(config.COOKIE_SECRET));
	app.use(express.session({secret: config.COOKIE_SECRET}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(path.join(application_root, "public")));
	app.use(app.router);
	app.use(function(err, req, res, next) { render_error(err, res); })
	app.set('view engine', 'jade');
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

// Error handling.
var error_msgs = {
	403: "You shall not go there.",
	404: "Wtf?",
	500: "I am not feeling well."
}

function render_error(err, res, num) {
	var status = num ? num : 500;
	var message = err ? err : error_msgs[status];
	res.status(status).render('error', { error: status, msg: message })
}

// Express API.
app.post('/api/login', 
	function (req, res, next) {
		passport.authenticate('local', 
			function (err, user, info) {
				if (err) 
					return next(err);

				if (!user) 
					return render_error(null, res, 403);

				res.render('home', {"user": user});
			}
		)(req, res, next);
	});

app.post('/api/register',
	function (req, res, next) {
		UserDb.addUser(req.body.username, req.body.email, req.body.password, function(success) {
			if(!success) {
				render_error(null, res, 500);
			} else {
				res.redirect('/index.html');
			}
		});
	});

app.get('/home',
	function (req, res, next) {
		// req.user is set if session is established!
		if(!req.user)
			render_error(null, res, 403);	
		else
			res.render('home', {"user": user});	
	});

app.get('*',
	function (req, res, next) {
		render_error(null, res, 404);
	});

// Launch server
app.listen(config.HTTP_PORT);
