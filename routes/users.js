var express = require('express');
var router = express.Router();
var multer = require("multer");
var User = require('../models/user');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
/* GET users listing. */
var flash = require('connect-flash');
var bodyparser = require("body-parser");

router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:"register"});
});

router.get('/login', function(req, res, next) {
  res.render('login',{title:"login"});
});

router.get('/dashboard', function(req, res, next) {
  if(req.isAuthenticated()) {
    console.log(req.user.id);

    User.getUserFriends(req.user.id,function(err,friendsList){
      console.log(friendsList);
      var List = friendsList[0].friends;
      var Name= friendsList[0].name;
      var AllFriends = [];
      for(var eachFriend=0;eachFriend<List.length;eachFriend++){
        AllFriends.push({"name":List[eachFriend].FriendName,
        "id":List[eachFriend].userId});
      }
      res.render('dashboard',{title:"Dashboard",friends:AllFriends,name:Name,UserId:req.user.id});
      
    });
  } else {
    res.redirect('/users/login')
  }
});

  router.get('/call', function(req, res, next) {
    if(req.isAuthenticated()) {
      res.render('call',{title:"call"});
    } else {
      res.redirect('/users/login')
    }});

router.post('/login',function(req,res,next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      req.flash('danger', 'Invalid Username or Password');
     return res.render('login', { messages: req.flash('danger') })
       }
    req.logIn(user, function(err) {
      if (err) { return next(err); }

      res.redirect('/users/dashboard');
    });
  })(req, res, next);
})


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use('local',new localStrategy(function(email,password,done){
  User.getUserByEmail(email,function(err,user){
    if(err) throw done(err);
    if(!user){
      return done(null,false,{messages:'invalid User'})
    }

    User.comparePassword(password,user.password,function(err,isMatch){
      if(err) return done(err)

      if(isMatch) {
        return done(null,user);
      }else{
        return done(null,false,{message:"Some Info is incorrect"})
      }
    });
  });
}));


router.post('/register', function(req, res, next) {
  console.log(req.body);
  var name = req.body.name;
  var username = req.body.userName;
  var pass = req.body.password;

  req.checkBody('name','name field is required').notEmpty();
  req.checkBody('userName','userName field is required').notEmpty();
  req.checkBody('password','password field is required').notEmpty();
  req.checkBody('password2','passwords does not match').equals(req.body.password);
  var errors = req.validationErrors();

  if(errors){
    res.render('register',{"errors":errors})
  }else{
    var newUser = new User({
      name:name,
      username:username,
      password:pass
    });
    User.createUser(newUser,function(err,user){
      if(err) throw err;
        console.log(user);
    });

    req.flash('info', 'Your account has been successfully created!');
    res.render('index',{messages:req.flash('info')})
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout',function(req,res){
  req.logout();
  res.redirect('/users/login')
})

module.exports = router;
