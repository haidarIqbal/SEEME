var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var session = require("express-session");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy
var multer = require("multer");
var flash = require("connect-flash");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var db = mongoose.connection;
var ExpressValidator = require("express-validator")
var routes = require("./routes/index");
var users = require("./routes/users");
var flash = require('connect-flash');
var bcrypt = require("bcryptjs");
var socketIO = require("socket.io");
var http= require("http");
var moment = require("moment");
var app = express();

var port = process.env.PORT || '3000';
var server = http.createServer(app);
var io = socketIO(server);

var connectedUsers ={};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));
//app.use('/scripts', express.static(`${__dirname}/node_modules/`));
app.use(session({
  secret:"secret",
  saveUninitialized:true,
  resave:true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(ExpressValidator({
  errorFormatter:function(params,msg,value){
    var namespace = params.split('.'),
    root = namespace.shift(),
    formParam = root;
    
    while(namespace.length){
      formParam +='['+ namespace.shift() + ']';

    }
    return{
      param:formParam,
      msg:msg,
      value:value
    }
  }
}));

app.use(flash());
app.use(function(req,res,next){
  res.locals.message = require('express-messages')(req,res);
  next()
});

app.get('*',function(req,res,next){
  res.locals.user = req.user || null
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

io.on('connection',(socket)=>{
  console.log("new User Connected");
  
  socket.on('username',function(data){
    connectedUsers[data] = socket;
    console.log(data);

    socket.on('join-chat',function(info){
      connectedUsers[info.to].emit('videochat',{
        from:info.from,
        room:info.room,
        createdAt:new Date().getTime()
      });
    });
  });
  // socket.emit('newEmail',{
  //   from:'mike',
  //   text:'hey whats going on',
  //   createdAt:new Date()
  // });
  
  socket.on('privateMessage',(message)=>{
    if(message.to !== undefined){
      console.log(connectedUsers[message.to])
    connectedUsers[message.to].emit('newMessage',{
      from:message.from,
      text:message.text,
      createdAt:new Date().getTime()
    });

    connectedUsers[message.from].emit('newMessage',{
      from:message.from,
      text:message.text,
      createdAt:new Date().getTime()
    });
  }
  console.log('new Message', message);

  });

  socket.on("disconnect",()=>{
    console.log("user disconnected");
  })
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port,()=>{
  console.log("server running at port " +port);
});
