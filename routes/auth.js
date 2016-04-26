var express = require('express');
var router = express.Router();
// var bodyParser = require('body-parser'),
//     expressValidator = require('express-validator')
//     , routes     = require('./routes')
//     , user       = require('./routes/user')
//     , common     = require('./routes/common')
//     ,
//     fs = require('fs'),
//     stylus = require('stylus'),
//     nib = require('nib'),
//     http = require('http'),
//     util = require('util'),
//     path = require('path'),
//     MongoClient = require('mongodb').MongoClient;
//Declare Express-Validator
// app.use(express.session({ secret: 'keyboard cat', cookie: { maxAge: 300000 } }));

var tbUser;
var image;
MongoClient.connect("mongodb://localhost:27017/profile", function(err, db) {
    if (!err) {
         tbUser = db.collection('user');
        image = db.collection('image');

    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'login' });
});
router.post('/signup', function(req, res, next) {
    console.log("hiiiiiiiiii");
    req.assert('Name', 'Name is required').notEmpty(); //Validate name
    req.assert('uname', 'User Name is required').notEmpty();
    req.assert('email', 'A valid Email is required').isEmail();
    req.assert('password', 'length should be lies between 6 &10').len(6, 10);
    var errors = req.validationErrors();
    if (!errors) {
        var name = req.body.Name;
        var Email = req.body.email;
        var uname = req.body.uname;
        var password = req.body.password;
        var img = "profile.png";
        console.log("sss"+Email);
        var post={
        	name:name,
        	email:Email,
        	uname:uname,
        	password:password,
        	img:img,
        	followers:[],
        	postsImg:[],
            request:[],
            friend:[]
        
        };
        tbUser.insert(post,function(err,result){
        	if(!err){
        		
        		res.render('loginMain', { title: 'login' });
        		
        	}
        	else
        	{
        		res.send("something is not right");

        	}
        });

    } else {
        res.render('login',{data:JSON.stringify(errors)})
    
        console.log(errors);
    }
});
router.post('/signin', function(req, res, next) {
    console.log("checkingggggg");
	var user=req.body.uname;
	var pass=req.body.password;
	var post={
		uname:user,
		password:pass
	};
	tbUser.find(post).toArray(function(err, result){
		if(result!=0){
			req.session.uname=user;
			console.log("sess "+req.session.uname);
            res.redirect("/users/home");
			

		}
		else
		{
res.render('loginMain',{ data: 'failed' });
		}
	})
    
});

router.get('/logout', function(req, res, next) {
    sess = req.session;
    console.log(sess);
    sess.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });

});



module.exports = router;
