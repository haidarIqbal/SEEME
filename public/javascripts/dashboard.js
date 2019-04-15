var socket = io();

socket.on('connect',function(){
    console.log("connected to server");

    // socket.emit('createEmail',{
    //     toaddress:"1231231231231",
    //     text:'hello from client'
    // })
});

socket.on('disconnect',function(){
    console.log("disconnected from server");
});

// socket.on('newEmail',function(email){
//     console.log("new Message fired",email);
// })
$('.eachFriend').on('click',function(e){
    var clicked = e.target.id;
    console.log(e);
    var allfriends = $('.eachFriend');
    
    $('#'+clicked).css('backgroundColor',"yellow");

    
});

  