const express = require("express");
const socket = require("socket.io");
const http = require("http");

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);

var User = require("./models/user")
var path = require("path")
var mongoose = require("mongoose")
var params = require("./params/params");
var bodyParser = require("body-parser");
var passport = require("passport");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var setUpPassport = require("./setuppassport");
var flash = require("connect-flash");

// Set static folder
app.use(express.static("public"));

// Socket setup
const io = socket(server);

// Players array
let users = [];

//const { rest } = require('lodash');
app.use(bodyParser.urlencoded({ extended: false }));

io.on("connection", (socket) => {
  console.log("Made socket connection", socket.id);
//socket.emit("cmsg",'oi')

  socket.on("msg",message=>{
socket.broadcast.emit('cmsg',message)
  })
  
  socket.on("join", (data) => {
    users.push(data);
    io.sockets.emit("join", data);
  });

  socket.on("joined", () => {
    socket.emit("joined", users);
  });

  socket.on("rollDice", (data) => {
    users[data.id].pos = data.pos;
    const turn = data.num != 6 ? (data.id + 1) % users.length : data.id;
    io.sockets.emit("rollDice", data, turn);
  });

  socket.on("restart", () => {
    users = [];
    io.sockets.emit("restart");
  });
});

mongoose.set('strictQuery', false)

var db = mongoose.connect(params.DATABASECONNECTION, function (error, response) {
    if (error) { console.log(error); }
    else { console.log('connected' + db) }
});
setUpPassport();

app.use(cookieParser());
app.use(session({
    secret: "lsd64fkbs345alnkf55sdkbj",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

var index = require ('./display')

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");

  index.displyuser (res.locals.currentUser)

  res.locals.info = req.flash("info");
    next();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//server.listen(app.get("port"), () => {
  //console.log("Now listening on port " + app.get("port"));
//});

/* User Login */
app.post("/login", passport.authenticate("user", {
  successRedirect: "/dice.html",
  failureRedirect: "/login.html",
  failureFlash: true
}));

app.post("/signup", function (req, res, next) {
  //var mod = new model(req.body);

  User.findOne({ email: req.body.email }, function (err, user) {
      if (err) { return next(err); }
      if (user) {
          //req.flash("error", "There's already an account with this email");
          //return res.redirect("/login");
          console.log("There's already an account with this email")
      }
      var newUser = new User({
          username: req.body.username,
          email: req.body.email,
          contact: req.body.contact,
          nic: req.body.nic,
          password: req.body.password
      });
      newUser.save(next);
      res.sendFile(__dirname + '/public/login.html');
  });
})

app.get("/logout", function (req, res) {
  req.logout(function (err) {
      if (err) { return next(err); }
      res.sendFile(__dirname + '/public/index.html');
    });
});