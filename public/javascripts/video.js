
window.addEventListener('load', () => {

    
    // Local Video
    const localVideoEl = $('#local-video');
   
    
    // Remote Videos
   // const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
    //const remoteVideosEl = $('#remote-videos');
    //let remoteVideosCount = 0;
    
   
    const webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remote-videos',
        // immediately ask for camera access
        autoRequestMedia: true,
      });
      
      // We got access to local camera
      webrtc.on('localStream', () => {
        localVideoEl.show();
      });


 
});