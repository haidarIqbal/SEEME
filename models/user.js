var mongoose = require("mongoose");
var bcrypt = require("bcryptjs")

mongoose.connect("mongodb+srv://haidar:Stain123@users-v1n2h.mongodb.net/test?retryWrites=true", { useNewUrlParser: true });

var db =mongoose.connection;

var userSchema = mongoose.Schema({
    name:{
        type:String
    },
    username:{
        type:String
    },
    friends:[{
        userId:{
            type:String
        },
        FriendName:{
            type:String
        }
    }],
    password:{
        type:String
    }

});

var User = module.exports =mongoose.model('User',userSchema);

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

module.exports.getUserByEmail = function(userName,callback){
    var query ={username:userName};
    User.findOne(query,callback);
}

module.exports.comparePassword = function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
       callback(null,isMatch);
    });
    
}

module.exports.createUser = function(newUser,callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash
            newUser.save(callback);

        });
    });
}

module.exports.getUserFriends = function(id,callback){
    var id = {_id:id}
    User.find(id,{friends:"friends",name:"name"},callback)
}

