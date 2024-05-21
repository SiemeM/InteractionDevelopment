const options = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: false, // Zorgt dat het beeld niet gespiegeld wordt
  minConfidence: 0.5,
  maxPoseDetections: 5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'multiple',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

let video;
let poses = [];
let balloons = [];
let score = 0;
let lives = 3;
let balloonInterval;

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('video-container');
  video = createCapture(VIDEO);
  video.hide();
  const poseNet = ml5.poseNet(video, options, () => console.log('Model Loaded!'));
  poseNet.on('pose', results => poses = results);

  // Start met één ballon
  balloons.push(new Balloon());

  // Automatisch nieuwe ballonnen toevoegen elke 4 seconden
  balloonInterval = setInterval(() => {
    if (lives > 0) { // Voeg alleen ballonnen toe als de speler nog levens heeft
      balloons.push(new Balloon());
    } else {
      clearInterval(balloonInterval); // Stop met het toevoegen van ballonnen als er geen levens meer zijn
    }
  }, 4000);
}

function draw() {
  background(0);

  // Spiegel de video handmatig met translate en scale
  push(); // Start een nieuwe tekeningstaat
  translate(width, 0); // Verplaats de tekening naar rechts
  scale(-1, 1); // Spiegel het beeld horizontaal
  image(video, 0, 0); // Teken de video op de gespiegelde locatie
  pop(); // Herstel de oorspronkelijke tekeningstaat

  drawPoses();
  updateAndDisplayBalloons();
  displayScoreAndLives();
}


function drawPoses() {
  fill(255, 0, 0);
  noStroke();
  rectMode(CENTER);
  poses.forEach((pose) => {
    pose.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.2 && (keypoint.part === 'rightWrist' || keypoint.part === 'leftWrist')) {
        // Spiegel de x-coördinaat van de keypoints
        let mirroredX = width - keypoint.position.x;
        ellipse(mirroredX, keypoint.position.y, 20, 20);
      }
    });
  });
}


class Balloon {
  constructor() {
    this.x = random(width);
    this.y = height;
    this.size = random(20, 40);
  }

  move() {
    this.y -= random(2, 5);
  }

  display() {
    fill(255, 100, 100);
    ellipse(this.x, this.y, this.size, this.size);
  }

  checkCollision(x, y) {
    let d = dist(x, y, this.x, this.y);
    if (d < this.size / 2) {
      score += 10;
      return true;
    }
    return false;
  }
}

function updateAndDisplayBalloons() {
  for (let i = balloons.length - 1; i >= 0; i--) {
    balloons[i].move();
    balloons[i].display();
    if (balloons[i].y + balloons[i].size < 0) {
      balloons.splice(i, 1);
      lives--;
      if (lives <= 0) {
        alert('Game Over! Refresh to play again.');
        noLoop(); // Stop the draw loop
      }
    }
    poses.forEach((pose) => {
      pose.pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.2 && balloons[i] && (keypoint.part === 'rightWrist' || keypoint.part === 'leftWrist')) {
          let mirroredX = width - keypoint.position.x; // Gebruik gespiegelde x-coördinaat
          if (balloons[i].checkCollision(mirroredX, keypoint.position.y)) {
            balloons.splice(i, 1);
            score += 10;
          }
        }
      });
    });
  }
}


function displayScoreAndLives() {
  fill(255);
  textSize(16);
  text(`Score: ${score}`, 10, 20);
  text(`Lives: ${lives}`, 10, 40);
}
