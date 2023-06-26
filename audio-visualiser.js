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
    
    // Set up the visuals (bars) dimensions
    let barWidth = (WIDTH / bufferLength) * 1.5;
    let barHeight;
    let x = 0;
     
    // function to render the visuals

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      // Styling the canvas
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Displaying the bars and colors
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
        let r = 52;
        let g = 213;
        let b = 235;

        // Colors of each bar
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    
    }      
    audio.play();
    renderFrame();
  }