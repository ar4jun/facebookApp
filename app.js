var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var bodyParser = require('body-parser'),
    session = require('express-session'),
    router = express.Router(),
    io = require('socket.io')(http),

expressValidator = require('express-validator'),

    fs = require('fs'),
    stylus = require('stylus'),
    nib = require('nib'),

    http = require('http').Server(app),
    util = require('util'),
    multer = require('multer'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient;
//Declare Express-Validator
var app = new express();


MongoClient.connect("mongodb://localhost:27017/profile", function(err, db) {
    if (!err) {
        var collection = db.collection('user');
        var image = db.collection('image');

    } else {
        console.log(err);
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('imgPath', path.join(__dirname, '/public/images/'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/images' }));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator()); //required for Express-Validator 
app.use(session({
    secret: 'sdfsdfsdfsdfsd',
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());




function isAuthenticated(req, res, next) {
    console.log("nexttttttzzzz");
    var sess = req.session;
    //console.log(sess);
    if (sess.uname) {

        next();
    } else {

        // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
        console.log("haaaaaaaaaa");
        return res.redirect('/auth/login');

    }
}

// app.use('/', routes);
app.use('/users', isAuthenticated, users);
app.use('/auth', auth);

app.get('/', isAuthenticated, function(req, res) {
    console.log("going /users/home");
    var sess = req.session;
    res.redirect('/users/home');
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log("page not found");
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//chat application


io.on('connection', function(socket) {
    console.log('New Socket Connection');
    console.log(Object.keys(users));
    var connectedUserId = socket.handshake.query.userId;
    if (connectedUserId in users) {
        console.log('UserId :' + connectedUserId + ' already Connected');
        socket.userId = connectedUserId;
        users[socket.userId] = socket;
        
    } else {
        console.log('New User Connected');
        socket.userId = connectedUserId;
        users[socket.userId] = socket;
        console.log(socket.userId);
        io.emit('new user', socket.userId);      //only new user will be append to the online users
        

    }



    socket.on('chat message', function(msg) {
        console.log('message: ' + msg.sender);
        users["" + msg.recvr + ""].emit('chat message', msg);
        users["" + msg.sender + ""].emit('chat message', msg);
        users1.insert(msg);
    });
});


module.exports = app;
