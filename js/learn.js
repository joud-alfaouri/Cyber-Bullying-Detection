onsole.clear();

document.addEventListener('DOMContentLoaded', function() {
  const introContainer = document.querySelector('.intro');
  const videoContainer = introContainer.querySelector('.popout-video');
  const video = videoContainer.querySelector('video');
  let videoHeight = videoContainer.offsetHeight;

  const closeVideoBtn = document.querySelector('.close-video');

  let popOut = true;
  
  introContainer.style.height = `${videoHeight}px`;

  window.addEventListener('scroll', function(e) {
    if (window.scrollY > videoHeight) {
      // only pop out the video if it wasnt closed before
      if (popOut) {
        videoContainer.classList.add('popout-video--popout');
        // set video container off the screen for the slide in animation
        videoContainer.style.top = `0px`;
      }
    } else {
      videoContainer.classList.remove('popout-video--popout');
      
      popOut = true;
    }
  });

  // close the video and prevent from opening again on scrolling + pause the video
  closeVideoBtn.addEventListener('click', function() {
    videoContainer.classList.remove('popout-video--popout');

    video.pause();
    popOut = false;
  });
  
  window.addEventListener('resize', function() {
    videoHeight = videoContainer.offsetHeight;
    introContainer.style.height = `${videoHeight}px`;
  });
});