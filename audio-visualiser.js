document.querySelectorAll(".upload-button").forEach((uploadItems) => {
    const uploadElement = uploadItems.closest("#upload-section");
  
    // Add functionality for drag/drop, click and change of Audio files
    uploadElement.addEventListener("click", (e) => {
      uploadItems.click();
    });
  
    uploadItems.addEventListener("change", (e) => {
      if (uploadItems.files.length) {
        handleAudioFile(uploadItems.files[0]);
      }
    });
  
    uploadElement.addEventListener("dragover", (e) => {
      e.preventDefault(); // Prevent default behaviour to allow drop
      uploadElement.classList.add("drag-drop-zone-over");
    });
  
    ["dragleave", "dragend"].forEach((type) => {
      uploadElement.addEventListener(type, (e) => {
        uploadElement.classList.remove("drag-drop-zone-over");
      });
    });
  
    uploadElement.addEventListener("drop", (e) => {
      e.preventDefault(); // Prevent default behaviour to allow drop
  
      if (e.dataTransfer.files.length) {
        uploadItems.files = e.dataTransfer.files;
        handleAudioFile(e.dataTransfer.files[0]); // Play audio file and handle visualisation
      }
  
      uploadElement.classList.remove("drag-drop-zone-over");
    });
  });
  
  // Function to handle the dropped audio file
  function handleAudioFile(file) {
    
    let audio = document.getElementById("audio");
    let files = file;
    audio.src = URL.createObjectURL(files);
    audio.load();
    audio.play();
    document.querySelector('.title').innerHTML = file.name ? file.name : '';
    let context = new AudioContext();
    let src = context.createMediaElementSource(audio); // create a new media element source node to play and manipulate the audio
    let analyser = context.createAnalyser(); // create a node to expose audio time and frequency to create a visualisation
    
    // Set up the Canvas to display the audio visualisation
    let canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 80/100;
    canvas.height = 300;
          
    let ctx = canvas.getContext("2d");
      
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 256;
      
    let bufferLength = analyser.frequencyBinCount;      
    let dataArray = new Uint8Array(bufferLength);
      
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, HEIGHT);
    ctx.stroke();
    ctx.closePath();

    // Set up the visuals (bars) dimensions
    let barWidth = (WIDTH / bufferLength) * 1.5;
    let barHeight;
    let x = 0;
    let sliceWidth = WIDTH * 1.0 / bufferLength;
    
    // Function to render the visuals
    function renderFrame() {
      requestAnimationFrame(renderFrame);
     
      let theme = document.querySelector('input[name="theme"]:checked').value;
      let color = document.querySelector('input[name="color"]:checked').value;
      if(theme === 'Waveform'){ // Displays waveform visuals
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        analyser.getByteFrequencyData(dataArray);
        let start = 0;
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 1;
        ctx.strokeStyle = color === 'Red' ? 'red' : 'blue';
        ctx.beginPath();
        x = 0;
        for (let i = start; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x = i * sliceWidth //frequencyBins/analyser.sampleRate;
        }
        ctx.lineTo(WIDTH, dataArray[0] / 128.0  * HEIGHT / 2);
        ctx.stroke();
      } else {
      // Display Bar graph visuals
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        x = 0 ; 
        
        let r;
        let g;
        let b;
        // Displaying the bars and colors
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          if(color === 'Blue'){
            r = 52;
            g = 213;
            b = 235;
          } else if(color === 'Red'){
            r = 217;
            g = 33;
            b = 20;
          } else {
            r = barHeight + (25 * (i/bufferLength));
            g = 250 * (i/bufferLength);
            b = 150;  
          }
          // Colors of each bar
          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
      }
      }
    }      
    audio.play();
    renderFrame();
    if (audio.paused) {
      document.querySelector('#icon-play').style.display = 'block';
      document.querySelector('#icon-pause').style.display = 'none';
      audio.play();
    }else{
      document.querySelector('#icon-play').style.display = 'none';
      document.querySelector('#icon-pause').style.display = 'block';
    }
  }

 
  let uploadedAudio = document.getElementById("audio");
  
  uploadedAudio.load();

  uploadedAudio.onloadedmetadata = function() {
    document.getElementsByClassName('duration')[0].innerHTML = getMinutes(uploadedAudio.duration)
  }.bind(this);

  let timer = document.getElementById("timer");
  let barProgress = document.getElementById("progressBar");
  let width = 0;

  function getMinutes(t){
    let min = parseInt(parseInt(t)/60);
    let sec = parseInt(t%60);
    if (sec < 10) {
      sec = "0"+sec
    }
    if (min < 10) {
      min = "0"+min
    }
    return min+":"+sec
  }


  let progressbar = document.querySelector('#progress')
  progressbar.addEventListener("click", seek.bind(this));


  function seek(event) {
    let percent = event.offsetX / progressbar.offsetWidth;
    uploadedAudio.currentTime = percent * uploadedAudio.duration;
    barProgress.style.width = percent*100 + "%";
  }

  function onTimeUpdate() {
    let t = uploadedAudio.currentTime;
    timer.innerHTML = getMinutes(t);
    this.setBarProgress();
  }

  // Function to update the progress time of the audio
  function setBarProgress(){
    let progress = (uploadedAudio.currentTime/uploadedAudio.duration) * 100;
    barProgress.style.width = progress + "%";
  }

  // Function to rewind the audio by 10 seconds
  function rewind(){
    uploadedAudio.currentTime =uploadedAudio.currentTime - 10;
    this.setBarProgress(); // set the time progress accordingly
  }
  
  // Function to forward the audio by 10 seconds
  function forward(){
    uploadedAudio.currentTime =uploadedAudio.currentTime + 10;
    this.setBarProgress(); // set the time progress accordingly
  }
  
  // Function to play and pause the Audio
  function playPause() {
    if (uploadedAudio.paused) {
      document.querySelector('#icon-play').style.display = 'none';
      document.querySelector('#icon-pause').style.display = 'block';
      uploadedAudio.play();
    }else{
      document.querySelector('#icon-play').style.display = 'block';
      document.querySelector('#icon-pause').style.display = 'none';
      uploadedAudio.pause();
    }
  }

  // Function to mute and unmute using volume button
  function toggleMute(){
    let volumeUp = document.querySelector('#icon-vol-up');
    let volumeMute = document.querySelector('#icon-vol-mute');
    if (uploadedAudio.muted == false) {
      uploadedAudio.muted = true
      volumeUp.style.display = "none"
      volumeMute.style.display = "block"
    }else{
      uploadedAudio.muted = false
      volumeMute.style.display = "none"
      volumeUp.style.display = "block"
    }
  }