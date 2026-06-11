// brightness mirror
// see notebook
// smaller capture video draw to canvas not pixel but shape or character
let myvideo;
let vScale; // global video scaling variable
//let greyscale = [0,32,64,96,128,160,192,224,255,255,255,255,255]
let greyscale = [0, 32, 64, 96, 128, 160, 192, 224, 255];

let gs = [];

function preload() {
  //gs[10] = loadImage("gs/p0.jpg");
  //gs[9] = loadImage("gs/p0.jpg");
  //gs[8] = loadImage("gs/p0.jpg");
  gs[5] = loadImage("gs/p0.png");
  gs[4] = loadImage("gs/p1.png");
  //gs[5] = loadImage("gs/p2.png");
  gs[3] = loadImage("gs/p3.png");
  // gs[3] = loadImage("gs/p4.png");
  gs[2] = loadImage("gs/p5.png");
  gs[1] = loadImage("gs/p6.png");
  gs[0] = loadImage("gs/p6.png");
}
function setup() {
  createCanvas(windowWidth, windowHeight); // larger canvas to draw to
  print(gs.length);

  if (width < height) {
    vScale = floor(width / 25); // vScale tied to window width so it can work on phone and computer
    console.log("by width");
  } else {
    vScale = floor(height / 25);
    console.log("by height");
  }
  pixelDensity(1);
  myvideo = createCapture(VIDEO);
  myvideo.size(width / vScale, height / vScale);
  myvideo.hide();
  // video dom element , the source, will be smaller by vScale which is 40 by 30 to improve performance
  frameRate(5);
  textAlign(LEFT, TOP);
  for (let i = 0; i < gs.length; i++) {
    gs[i].resize(vScale, 0);
  }
}

function draw() {
  background(250, 240, 230);

  // load the myvideo to pixel array
  myvideo.loadPixels(); // gets a pixes arry for video capture

  // loop through the small video capture
  for (let y = 0; y < myvideo.height; y++) {
    // for each y there are some x's
    for (let x = 0; x < myvideo.width; x++) {
      //this mirrors the index for see note book
      let index = (myvideo.width - x - 1 + y * myvideo.width) * 4;
      let r = myvideo.pixels[index + 0];
      let g = myvideo.pixels[index + 1];
      let b = myvideo.pixels[index + 2];

      let bright = floor((r + g + b) / 3); // the brightness or greyscale 0-255 is the average of the rgb
      // let hanidx = floor(map(bright, 0, 255, 0, hanzi.length - 1));
      let gsidx = floor(map(bright, 0, 255, 0, gs.length - 1));
      print(gsidx);
      //print(gscale)
      // variable cindex is the index of the chineseChar

      //cindex = map(bright, 0, 255, 1, 8);

      //draw a random character on the large canvas with the brightness of each pixel on the small dom video
      fill(0); // this is the restricted
      //fill(bright); // this is the full range
      // we need to multply by vscale to set the place for larger video
      //textSize(vScale);
      //text(random(chiChar), x * vScale, y * vScale);
      noStroke();
      //textSize(vScale);
      //text(hanzi[hanidx], x * vScale, y * vScale);
      image(gs[gsidx], x * vScale, y * vScale);
      //image(gs[1], x * vScale, y * vScale);
    }
  }

  //console.log('bing');
  //noLoop();
}

function keyPressed() {
  // this will download the first 25 seconds of the animation!
  //if (key === 'g') {
  //  saveGif('reflection.gif', 15);
  // }
  if (key === "s") {
    saveCanvas("characterB", "jpg");
  }
}
