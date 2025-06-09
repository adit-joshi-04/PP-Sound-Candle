let mic;
let fire;

let particles = [];
let particleSize = 40;
let speedRange = { min: 3, max: 8 };
const MAX_PARTICLES = 300;

let vol;
let fireSize;

let sensitivity;
let sens;

let shouldRespawnParticles = false;
let particleAccumulator = 0;

let smoothedVol = 0;
let easing = 0.05; // between 0.05 and 0.15

let volumeThreshold = 0; 

let happy;
let startBtn;

let started = false;

let micStream;
let audioContext;
let analyser;
let dataArray;
let volume = 0;

window.addEventListener("DOMContentLoaded", () => {
  

  document.querySelector('.permission-button').addEventListener("touchstart", () => {
    mousePressed();
  });
});

function preload() {
  fire = loadImage("fire.png");
  candle = loadImage("candle.png");
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  
  //mic.start();
  
  
  
  imageMode(CENTER);
  happy = document.querySelector('.happy');
  subtext = document.querySelector('.subtext');
  startBtn = document.querySelector('.permission-button');
  slider = document.querySelector('.slider-container');



}

function draw() {

  //console.log(getAudioContext().state);

  

  if (started) {
    // console.log(getAudioContext().state);  
    background('#FFD60D');

    if (analyser) {
          analyser.getByteTimeDomainData(dataArray);

          // Calculate volume as average deviation from center (128)
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            let val = dataArray[i] - 128;
            sum += Math.abs(val);
          }
          volume = sum / dataArray.length;
          //console.log(volume);
    }

    // fill('white');
    // textAlign(CENTER, CENTER);
    // textSize(32);
    // text(getAudioContext().state, width / 4, 200);

    happy.style.visibility = "visible";
    subtext.style.visibility = "visible";
    startBtn.style.visibility = "hidden";
    slider.style.visibility = "visible";

    let cakeY;
    let fireYOffset;
    let cakeWidth;


    if(isMobileLayout()) {
      cakeY = 260;
      fireYOffset = 50;
      cakeWidth = 400;
      fireSize = 70;
    } else {
      cakeY = 300;
      fireYOffset = 0;
      cakeWidth = 587;
      fireSize = 75;
    }

    let cakeHeight = cakeWidth * 1.097;
    
    push();
    translate(width/2, height/2.5);
    imageMode(CENTER);
    image(candle, 0, cakeY, cakeWidth, cakeHeight);
    pop();
    
    if (particles.length > MAX_PARTICLES) {
      particles.splice(0, particles.length - MAX_PARTICLES);
    }
    
    sensitivity = document.querySelector('#sensitivity').value;
    sens = map(sensitivity, 0, 1, 10, 40);
    
    //let rawVol = mic.getLevel() * 1.2;       // raw mic volume
    smoothedVol = lerp(smoothedVol, volume, easing); // eased version
    // fireSize = map(smoothedVol, 0, sens, 50, 150, true);
    
    //text(smoothedVol.toFixed(4), 100, 100);

    let spawnRate = 0;
    if (smoothedVol > volumeThreshold) {
      //spawnRate = map(smoothedVol, volumeThreshold, sens, 0, 2, true); // Now uses threshold as the new "zero"
      spawnRate = volume/sens;
    }
    particleAccumulator += spawnRate;

    // 🔄 Spawn whole particles based on accumulated float
    while (particleAccumulator >= 1 && particles.length < MAX_PARTICLES) {
      particles.push(createParticle());
      particleAccumulator -= 1;
    }

    if (particles.length > 40) {
      happy.textContent = "Wish granted.";
      subtext.textContent = "New website launching soon!"
    }

    // Allow respawn if volume is enough
    shouldRespawnParticles = spawnRate > 0.5;

    translate(width / 2, height / 2.5 + fireYOffset);  
    runParticles();

    push();

    imageMode(CORNER);
    image(fire, -fireSize / 2, -fireSize, fireSize, fireSize * 1.28);
    pop();
  } else {
    background('#FFD60D');
    happy.style.visibility = "hidden";
    subtext.style.visibility = "hidden";
    startBtn.style.visibility = "visible";
    slider.style.visibility = "hidden";
  }
}

function runParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    if (!p) continue;

    p.x += cos(p.angle) * p.speed;
    p.y += sin(p.angle) * p.speed;
    image(fire, p.x, p.y, particleSize, particleSize * 1.28);

    const isOffscreen =
      p.x < -width / 2 || p.x > width / 2 ||
      p.y < -height / 2 || p.y > height / 2;

    if (isOffscreen) {
      if (shouldRespawnParticles) {
        particles[i] = createParticle();
      } else {
        particles.splice(i, 1); // ❌ Remove the particle from array
        i--; // ⚠️ Step back since we removed an item
      }
    }
  }
}

function createParticle() {
  return {
    x: 0,
    y: 0,
    angle: random(-PI / 4, -3 * PI / 4),
    speed: random(speedRange.min, speedRange.max),
    trail: []
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function isMobileLayout() {
  return windowWidth < 600 && windowHeight < 700;
}

async function mousePressed() {
  if(!started) {
    // getAudioContext().resume();
    // mic = new p5.AudioIn();
    // mic.start();
    // started = true

    // Ask for mic access
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Set up audio context and analyser
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        dataArray = new Uint8Array(analyser.fftSize);

        source.connect(analyser);

        started = true;

  }
}
