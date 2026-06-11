// sketch.js - Paint Mirror with Huge Splotches & Frequent Clearing (5 sec)
let video;
let bgImg;
let ballHitImgs = [];
let kickFrames = [];

let kickIndex = 0;
let lastKickFrameTime = 0;
const KICK_FRAME_INTERVAL = 100;

let mirrorLayer;
let splotches = [];
const MAX_SPLOTCHES = 5000;
const NEW_SPLOTCHES_PER_FRAME = 100;

// EVEN LARGER splotches: 160–260px
const MIN_SPLOTCH_SIZE = 160;
const MAX_SPLOTCH_SIZE = 360;

// Clear every 5 seconds (more frequent)
let lastResetTime = 0;
const RESET_INTERVAL = 5000; // milliseconds

let assetsLoaded = false;
let loadedCount = 0;
const TOTAL_ASSETS = 6;

function hideLoadingScreen() {
    let loader = document.getElementById('p5_loading');
    if (loader) {
        loader.classList.add('hide-loading');
        setTimeout(() => {
            if (loader && loader.parentNode) loader.style.display = 'none';
        }, 700);
    }
}

function assetLoaded() {
    loadedCount++;
    if (loadedCount >= TOTAL_ASSETS) {
        assetsLoaded = true;
        setTimeout(hideLoadingScreen, 200);
    }
}

function preload() {
    bgImg = loadImage('background.png', assetLoaded, assetLoaded);
    ballHitImgs[0] = loadImage('ballhit1.png', assetLoaded, assetLoaded);
    ballHitImgs[1] = loadImage('ballhit2.png', assetLoaded, assetLoaded);
    kickFrames[0] = loadImage('kick1.png', assetLoaded, assetLoaded);
    kickFrames[1] = loadImage('kick2.png', assetLoaded, assetLoaded);
    kickFrames[2] = loadImage('kick3.png', assetLoaded, assetLoaded);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);

    mirrorLayer = createGraphics(width, height);
    mirrorLayer.pixelDensity(1);

    video = createCapture(VIDEO);
    video.size(80, 60);
    video.hide();

    lastKickFrameTime = millis();
    lastResetTime = millis();
    frameRate(30);

    drawBackgroundToLayer();

    setTimeout(() => {
        if (!assetsLoaded) hideLoadingScreen();
    }, 5000);
}

function drawBackgroundToLayer() {
    if (bgImg && bgImg.width > 0) {
        mirrorLayer.image(bgImg, 0, 0, width, height);
    } else {
        mirrorLayer.background(30, 20, 15);
    }
}

// ---------- CLEARING HAPPENS HERE (both automatic and manual) ----------
function resetMirror() {
    drawBackgroundToLayer();   // wipe offscreen layer, put fresh background
    splotches = [];            // discard all stored splotch data
    console.log("🧹 Canvas cleared at " + new Date().toLocaleTimeString());
}

function getBrightnessAtCanvasPos(canvasX, canvasY) {
    if (!video || video.width === 0 || !video.pixels) return 128;

    let mirroredX = width - canvasX;
    let vidX = floor(map(mirroredX, 0, width, 0, video.width));
    let vidY = floor(map(canvasY, 0, height, 0, video.height));

    vidX = constrain(vidX, 0, video.width - 1);
    vidY = constrain(vidY, 0, video.height - 1);

    let idx = (vidY * video.width + vidX) * 4;
    if (idx + 2 >= video.pixels.length) return 128;

    let r = video.pixels[idx];
    let g = video.pixels[idx + 1];
    let b = video.pixels[idx + 2];
    return (r + g + b) / 3;
}

function addSplotchToLayer(x, y) {
    if (splotches.length >= MAX_SPLOTCHES) splotches.shift();

    let brightness = getBrightnessAtCanvasPos(x, y);
    let img = (brightness > 128) ? ballHitImgs[0] : ballHitImgs[1];
    if (!img) return;

    let baseSize = random(MIN_SPLOTCH_SIZE, MAX_SPLOTCH_SIZE);
    let imgW = img.width;
    let imgH = img.height;
    let drawW, drawH;
    if (imgW > imgH) {
        drawW = baseSize;
        drawH = baseSize * (imgH / imgW);
    } else {
        drawH = baseSize;
        drawW = baseSize * (imgW / imgH);
    }

    splotches.push({ x, y, img, w: drawW, h: drawH });
    mirrorLayer.image(img, x - drawW/2, y - drawH/2, drawW, drawH);
}

function addGridSplotchToLayer() {
    let cols = 30;
    let rows = floor(cols * height / width);
    if (rows < 1) rows = 1;
    let cellW = width / cols;
    let cellH = height / rows;
    let col = floor(random(cols));
    let row = floor(random(rows));
    let x = col * cellW + random(cellW);
    let y = row * cellH + random(cellH);
    addSplotchToLayer(x, y);
}

function addRandomSplotchToLayer() {
    addSplotchToLayer(random(width), random(height));
}

function drawKicker() {
    let validKicks = kickFrames.filter(k => k && k.width > 0);
    if (validKicks.length === 0) return;

    let now = millis();
    if (now - lastKickFrameTime >= KICK_FRAME_INTERVAL) {
        kickIndex = (kickIndex + 1) % validKicks.length;
        lastKickFrameTime = now;
    }

    let kickImg = validKicks[kickIndex];
    let kickW = constrain(width * 0.18, 80, 180);
    let kickH = kickImg.height * (kickW / kickImg.width);
    let posX = 16;
    let posY = height - kickH - 20;

    drawingContext.shadowBlur = 12;
    drawingContext.shadowColor = "rgba(0,0,0,0.4)";
    image(kickImg, posX, posY, kickW, kickH);
    drawingContext.shadowBlur = 0;
}

function draw() {
    if (video && video.loadPixels) video.loadPixels();

    // Add new splotches each frame
    for (let i = 0; i < NEW_SPLOTCHES_PER_FRAME; i++) {
        if (random() < 0.7) addGridSplotchToLayer();
        else addRandomSplotchToLayer();
    }

    // Draw the persistent mirror layer
    image(mirrorLayer, 0, 0);
    drawKicker();

    // ---------- AUTOMATIC CLEARING EVERY 5 SECONDS ----------
    // This is where the canvas clears automatically.
    if (millis() - lastResetTime >= RESET_INTERVAL) {
        resetMirror();          // calls the clear function
        lastResetTime = millis();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    let newLayer = createGraphics(width, height);
    newLayer.pixelDensity(1);
    if (bgImg && bgImg.width > 0) {
        newLayer.image(bgImg, 0, 0, width, height);
    } else {
        newLayer.background(30, 20, 15);
    }
    for (let s of splotches) {
        newLayer.image(s.img, s.x - s.w/2, s.y - s.h/2, s.w, s.h);
    }
    mirrorLayer = newLayer;
}

function keyPressed() {
    // Manual clearing with 'r' or 'c' key
    if (key === 'r' || key === 'R' || key === 'c' || key === 'C') {
        resetMirror();
        lastResetTime = millis();
    }
    if (key === 's' || key === 'S') saveCanvas('paint_mirror', 'png');
}

function addBurstAt(x, y) {
    for (let i = 0; i < 40; i++) {
        addSplotchToLayer(x + random(-80, 80), y + random(-80, 80));
    }
}

function mousePressed() {
    addBurstAt(mouseX, mouseY);
    return false;
}

function touchStarted() {
    if (touches.length > 0) addBurstAt(touches[0].x, touches[0].y);
    return false;
}