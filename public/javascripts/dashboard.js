var socket = io();
var currentChat;
var clicked;
var from;
var localVideoEl;
var remoteVideosEl;


window.addEventListener('load', () => {
    from = $('#userInfo')[0].innerText.trim();
    localVideoEl = $('#local-video');
    remoteVideosEl = $('#remote-videos');
   
});
 
function scrollToBottom(){
    var messages = jQuery('#messages');
    var newMessage = messages.children(messages.children.length-1)
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
      messages.scrollTop(scrollHeight);
    }
}
socket.on('connect',function(){
    socket.emit('username',$('#userInfo')[0].innerText.trim()
    );
    console.log("connected to server"); 
});

socket.on('disconnect',function(){
    console.log("disconnected from server");
});

socket.on('newMessage',function(message){
    console.log("new message")
    var formatedTime = moment(message.createdAt).format("h:mm a")
    var template = $('#message-template').html()
    var html = Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formatedTime

    });
    $('#messages').append(html);
    scrollToBottom();
});

socket.on('videochat',function(info){
    const webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remote-videos',
        // immediately ask for camera access
        autoRequestMedia: true,
      });
   console.log(info);
   webrtc.joinRoom(info.room);
   webrtc.on('localStream', () => {
    localVideoEl.show();
  });

});
$('.eachFriend').on('click',function(e){
    $('.chat__main').css('display','flex')
    clicked = e.target.id;

    currentChat =e.target.innerText;
    $('#friendName')[0].innerText = currentChat;

});

$('.fas').on('click',function(){
    $('#local-video').css('display','block');
    var roomName = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remote-videos',
        // immediately ask for camera access
        autoRequestMedia: true,
      });
    webrtc.createRoom(roomName, (err, name) => {
        socket.emit('join-chat',{
            from:from,
            to:currentChat,
            room:roomName
        });
      });
      webrtc.on('localStream', () => {
        localVideoEl.show();
      });
      $('.chat__box').css('display','none')
      $('.chat__footer').css('display','none')
});

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

$('#message').on('submit',function(e){
    e.preventDefault();
    
    
    console.log(currentChat)
    socket.emit('privateMessage',{
        from:from,
        to:currentChat,
        text:$('[name=text]').val()
    },function(){

    });
});

  