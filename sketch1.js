// brightness mirror
// smaller capture video draw to canvas not pixel but shape or character
let myvideo;
let vScale; // global video scaling variable
let gs = []; // array to hold character images

function preload() {
  // Load images – adjust paths as needed
  // Only indices 0-5 are used (6 images total)
  gs[5] = loadImage("gs/p0.png");
  gs[4] = loadImage("gs/p1.png");
  gs[3] = loadImage("gs/p3.png");
  gs[2] = loadImage("gs/p5.png");
  gs[1] = loadImage("gs/p6.png");
  gs[0] = loadImage("gs/p6.png"); // same as index 1, but fine
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Determine scaling so that we have roughly 25 columns or rows
  if (width < height) {
    vScale = floor(width / 25);
    console.log("by width");
  } else {
    vScale = floor(height / 25);
    console.log("by height");
  }
  pixelDensity(1);

  // Create video capture and set its size to match the grid dimensions
  myvideo = createCapture(VIDEO);
  myvideo.size(width / vScale, height / vScale);
  myvideo.hide();

  frameRate(5);
  textAlign(LEFT, TOP);

  // Resize all loaded images to fit one grid cell (vScale x vScale)
  for (let i = 0; i < gs.length; i++) {
    if (gs[i]) {
      // safety check: only resize if image exists
      gs[i].resize(vScale, vScale);
    } else {
      console.warn(`Image at index ${i} failed to load`);
    }
  }
}

function draw() {
  background(250, 240, 230);

  // *** UPDATED FOR NEWER p5.js ***
  // Older versions allowed myvideo.loadPixels() directly on the video element.
  // In newer p5.js, we must capture the current video frame as a p5.Image
  // and then call loadPixels() on that image.
  let videoFrame = myvideo.get(); // capture current frame as p5.Image
  videoFrame.loadPixels(); // now we can access the pixels array

  // Loop through each cell (each pixel of the low‑res video frame)
  for (let y = 0; y < videoFrame.height; y++) {
    for (let x = 0; x < videoFrame.width; x++) {
      // Mirror horizontally: index = (width - x - 1) + y * width
      let index = (videoFrame.width - x - 1 + y * videoFrame.width) * 4;
      let r = videoFrame.pixels[index + 0];
      let g = videoFrame.pixels[index + 1];
      let b = videoFrame.pixels[index + 2];

      // Compute brightness (0–255)
      let bright = floor((r + g + b) / 3);
      // Map brightness to an index in the gs array
      let gsidx = floor(map(bright, 0, 255, 0, gs.length - 1));

      // Safety check: ensure the image exists before drawing
      if (gs[gsidx]) {
        image(gs[gsidx], x * vScale, y * vScale);
      } else {
        // Fallback: draw a black rectangle if image missing
        fill(0);
        noStroke();
        rect(x * vScale, y * vScale, vScale, vScale);
      }
    }
  }
}

function keyPressed() {
  // Press 's' to save a screenshot
  if (key === "s") {
    saveCanvas("characterB", "jpg");
  }
}
