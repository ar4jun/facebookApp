var express = require('express');
var router = express.Router(),
    multer = require('multer');

MongoClient = require('mongodb').MongoClient;


var tbUser;
var image;
var profile;
var array = [];
/* GET users listing. */
router.get('/users', function(req, res, next) {
    res.render('chat');
});

router.get('/like', function(req, res, next) {
    var userOg = req.param('postBy');
    console.log("userOg" + userOg);
    return userOg;
});
router.get('/profileView', function(req, res, next) {
    if (req.param('id')) {
        var name = req.param('id');
    } else {
        var name = req.session.uname;
    }
    var dataa;
    var sessUser = req.session.uname;

    // console.log("ff"+users);
    tbUser.find({ uname: sessUser }).toArray(function(err, data) {

        if (!err) {
            console.log("arraayyyy" + data.following)
            dataa = data;
            callback();
        } else {
            res.send(err);
        }


    })

    function callback() {
        tbUser.find({ uname: name }).toArray(function(err, data) {
            if (!err) {
                if (data.length > 0) {

                    res.render('profile', { data: dataa, session: req.session, datas: data });
                } else {
                    res.send("no such data found");
                }
            } else {
                res.send(err);
            }
        })
    }


});

router.get('/users', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/home', function(req, res, next) {
    var id = req.session.uname;
    console.log("check   " + id);
    tbUser.find({ uname: id }).toArray(function(err, data) {

        if (!err) {
            console.log("arraayyyy" + data.following)
            res.render('home', { data: data, session: req.session });
        } else {
            res.send(err);
        }
    })

});

MongoClient.connect("mongodb://localhost:27017/profile", function(err, db) {
    if (!err) {
        tbUser = db.collection('user');
        image = db.collection('image');
        profile = db.collection('profile');

    }
});


router.get('/edit', function(req, res, next) {

    var id = req.session.uname;
    tbUser.find({ "uname": id }).toArray(function(err, data) {
        if (!err) {
            console.log(data);
            console.log("hiiiii");
            res.render('edit', { data: data });
        } else {
            res.send(err);
        }
    })

});



router.get('/reqst', function(req, res, next) {
    var id = req.session.uname;
    var i;

    tbUser.find({ "uname": id }).toArray(function(err, data1) {
        if (!err) {

            console.log(data1[0].request);
            for (i = 0; i < data1[0].request.length; i++) {
                tbUser.find({ "uname": data1[0].request[i] }).toArray(function(err, data) {
                    if (!err) {
                        array.push(data[0]);

                    }

                });

            }
            if (i == data1[0].request.length) {
                callback();
            }




        }


    });

    function callback() {

        var id = req.session.uname;
        console.log("check   " + id);
        tbUser.find({ uname: id }).toArray(function(err, data2) {

            if (!err) {

                console.log("arrauy" + array);
                res.render('reqst', { datas: array, data: data2 });
                array = [];
            } else {
                res.send(err);
            }
        })
    }

});

router.post('/confirm', function(req, res, next) {
    var name = req.param('Name');

    var userName = req.session.uname;



    tbUser.update({ uname: userName }, { $push: { friend: name } }, function(err, data) {
        if (!err) {
            tbUser.update({ uname: name }, { $push: { friend: userName } }, function(err, data) {
                if (!err) {
                    tbUser.update({ uname: userName }, { $pull: { request: name } }, function(err, data) {
                        res.redirect('/users/home');
                    });
                }
            });


        }
    });

});










router.post('/update', function(req, res, next) {


    var name = req.param('name');
    var uname = req.param('uname');
    var email = req.param('email');
    var gender = req.param('gender');
    var dob = req.param('dob');
    console.log("dobbb" + dob);
    var place = req.param('place');
    var relation = req.param('relation');
    var about = req.param('me');
    var post = {
        name: name,
        uname: uname,
        email: email,
        gender: gender,
        dob: dob,
        place: place,
        relation: relation,
        about: about

    }
    tbUser.update({ uname: uname }, { $set: post }, function(err, data) {
        if (!err) {
            res.redirect('/users/home');
        } else { res.send(err); }
    })
});



router.post('/uploads', multer({ dest: './public/images/' }).single('upl'), function(req, res, next) {

    // console.log(req.body.title); //form fields
    console.log("seesin" + req.session.uname); //form fields
    var uname = req.session.uname;
    /* example output:
    { title: 'abc' }
     */
    var post = {

        img: req.file.filename

    };
    tbUser.update({ uname: uname }, { $set: post }, { w: 1 }, function(err, result) {
        if (!err) {

            res.redirect('/users/home');


        } else {
            res.send("Something went wrong please login again");
        }
    });

});
var postByPic;
var posts;
router.post('/posts', multer({ dest: './public/images/' }).single('upl'), function(req, res, next) {

    // console.log(req.body.title); //form fields

    console.log("seesin" + req.session.uname); //form fields
    var uname = req.session.uname;
    var Description = req.param('textarea');
    /* example output:
    { title: 'abc' }
     */

    tbUser.find({ uname: uname }).toArray(function(err, data) {
        if (!err) {
            postByPic = data[0].img;
            console.log("postby" + postByPic);
            callback();
        }
    });

    function callback() {
        posts = {

            images: req.file.filename,
            Description: Description,
            postBy: uname,
            postByPic: postByPic



        };
        tbUser.update({ uname: uname }, { $push: { postsImg: posts } }, function(err, data) {});

    }


    tbUser.find({ "uname": uname }).toArray(function(err, data) {
        if (!err) {

            console.log(data[0].friend);
            for (i = 0; i < data[0].friend.length; i++) {
                tbUser.update({ uname: data[0].friend[i] }, { $push: { postsImg: posts } }, function(err, data) {
                    // tbUser.update({ uname: data[0].friend[i] }, { $set: post }, { w: 1 }, function(err, result) {
                    if (!err) {


                        // res.redirect('/users/home');
                        console.log("postssss");


                    } else {
                        res.send("Something went wrong please login again");
                    }
                });
            }
            res.redirect('/users/home');
        }

    });

});


router.get('/logout', function(req, res, next) {
    res.redirect('/');
});

router.post('/search', function(req, res, next) {
    var name = req.param('name');
    var sessUser = req.session.uname;
    var flag;
    var dataa;
    tbUser.find({ friend: { $in: [name] }, uname: sessUser }).toArray(function(err, data) {
        // tbUser.find({ postsImg: { $elemMatch: { postBy: 'ajein' } },name: }).toArray(function(err, data) {
        // body...

        if (data.length > 0) {
            flag = 1;
        } else {
            flag = 0;
        }
        callback();

    });

    function callback() {
        if (name == sessUser) {
            flag = 1;
        }
    }
    tbUser.find({ uname: sessUser }).toArray(function(err, row) {

        if (!err) {
            console.log("sessUser" + sessUser);
            console.log("arraayyyy" + row)
            dataa = row;
            callback1();
        } else {
            res.send(err);
        }
    })



    function callback1() {
        tbUser.find({ uname: name }).toArray(function(err, data) {
            if (!err) {
                if (data.length > 0) {
                    console.log("kkkk" + dataa);
                    res.render('search', { datas: data, session: req.session, friendFlag: flag, data: dataa });
                } else {
                    res.send("no such data found");
                }
            } else {
                res.send(err);
            }
        })
    }
});
router.post('/follow', function(req, res, next) {
    var following = req.param('Name');
    console.log("doneeee" + following);
    var user = req.session.uname;


    console.log("sssss" + user);
    tbUser.update({ uname: following }, { $push: { request: user } }, function(err, data) {
        if (!err) {

            // tbUser.update({ uname: user }, { $push: { followers: user } }, function(err, result) {
            //     if (!err) {
            res.redirect("/users/home");

            //     } else {
            //         res.send(err);

            //     }
            // })
        } else {
            res.send(err);
        }

    })
});


module.exports = router;
