// sketch.js - Football Kick Canvas (touch to kick, paint splotches accumulate)
let bgImg;
let ballHitImgs = [];     // ballhit1.png, ballhit2.png
let kickFrames = [];      // kick1, kick2, kick3

let paintLayer;           // offscreen canvas for accumulated splotches

// Kicker animation state
let isKicking = false;
let kickIndex = 0;
let kickStartTime = 0;
let kickX = 0;
let kickY = 0;
const KICK_FRAME_DURATION = 100;   // ms per frame (100ms = 10fps for kick)
const KICK_FRAMES_TOTAL = 3;
const KICK_DISPLAY_DURATION = 300;  // total animation time (3 frames × 100ms)

// Instructions
let showInstructions = true;
let instructionFadeTime = 0;

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
    bgImg = loadImage('backgrounds.png', assetLoaded, assetLoaded);
    ballHitImgs[0] = loadImage('ballhit1.png', assetLoaded, assetLoaded);
    ballHitImgs[1] = loadImage('ballhit2.png', assetLoaded, assetLoaded);
    kickFrames[0] = loadImage('kick1.png', assetLoaded, assetLoaded);
    kickFrames[1] = loadImage('kick2.png', assetLoaded, assetLoaded);
    kickFrames[2] = loadImage('kick3.png', assetLoaded, assetLoaded);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);

    // Create offscreen layer for paint splotches
    paintLayer = createGraphics(width, height);
    paintLayer.pixelDensity(1);
    
    // Draw background onto paint layer once
    drawBackgroundToLayer();

    // Show instructions for 3 seconds
    showInstructions = true;
    instructionFadeTime = millis() + 3000;

    frameRate(30);

    setTimeout(() => {
        if (!assetsLoaded) hideLoadingScreen();
    }, 5000);
}

function drawBackgroundToLayer() {
    if (bgImg && bgImg.width > 0) {
        // Draw background to cover canvas (stretched)
        paintLayer.image(bgImg, 0, 0, width, height);
    } else {
        paintLayer.background(30, 20, 15);
    }
}

// Add a random paint splotch at a specific location
function addPaintSplotch(x, y) {
    let validImgs = ballHitImgs.filter(img => img && img.width > 0);
    if (validImgs.length === 0) return;

    let img = random(validImgs);
    
    // Random size: 80–200px (preserve aspect ratio)
    let baseSize = random(80, 200);
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
    
    // Draw directly onto offscreen layer
    paintLayer.image(img, x - drawW/2, y - drawH/2, drawW, drawH);
}

// Start the kicker animation at a specific position
function startKick(x, y) {
    isKicking = true;
    kickIndex = 0;
    kickStartTime = millis();
    kickX = x;
    kickY = y;
}

// Update and draw the kicker animation
function drawKickerAnimation() {
    if (!isKicking) return;
    
    let now = millis();
    let elapsed = now - kickStartTime;
    
    if (elapsed >= KICK_DISPLAY_DURATION) {
        isKicking = false;  // animation finished
        return;
    }
    
    // Determine which frame to show (0, 1, or 2)
    let frameIndex = floor(elapsed / KICK_FRAME_DURATION);
    frameIndex = constrain(frameIndex, 0, KICK_FRAMES_TOTAL - 1);
    
    let kickImg = kickFrames[frameIndex];
    if (!kickImg) return;
    
    // Draw kicker large (200–300px)
    let kickW = constrain(width * 0.35, 200, 350);
    let kickH = kickImg.height * (kickW / kickImg.width);
    
    // Position at the touch location (offset so foot hits the spot)
    let drawX = kickX - kickW/2;
    let drawY = kickY - kickH/2;
    
    // Add shadow for pop
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(0,0,0,0.5)";
    image(kickImg, drawX, drawY, kickW, kickH);
    drawingContext.shadowBlur = 0;
}

// Draw instructions (floating text, fades after 3 seconds)
function drawInstructions() {
    if (!showInstructions) return;
    
    let now = millis();
    let alpha = 255;
    
    if (now > instructionFadeTime) {
        showInstructions = false;
        return;
    }
    
    // Fade out in last 0.5 seconds
    let timeLeft = instructionFadeTime - now;
    if (timeLeft < 500) {
        alpha = map(timeLeft, 0, 500, 0, 255);
    }
    
    push();
    textAlign(CENTER, CENTER);
    textSize(min(width, height) * 0.05);
    fill(255, 255, 200, alpha);
    stroke(0, 0, 0, alpha * 0.7);
    strokeWeight(3);
    textFont('monospace');
    text("⚽ ART WORKERS FOOTBALL CANVAS ⚽\n\nTOUCH TO KICK!", width/2, height/2);
    pop();
}

function draw() {
    // Draw the paint layer (background + accumulated splotches)
    image(paintLayer, 0, 0);
    
    // Draw kicker animation on top (if active)
    drawKickerAnimation();
    
    // Draw instructions
    drawInstructions();
}

// Touch interaction: add paint splotch + start kicker animation
function touchStarted() {
    if (touches.length > 0) {
        let x = touches[0].x;
        let y = touches[0].y;
        
        // Add paint splotch at touch location
        addPaintSplotch(x, y);
        
        // Start kicker animation at the same location
        startKick(x, y);
    }
    return false;  // prevent default touch behavior
}

// Mouse click for desktop testing
function mousePressed() {
    addPaintSplotch(mouseX, mouseY);
    startKick(mouseX, mouseY);
    return false;
}

// Window resize: recreate paint layer and redraw everything
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Save existing splotches to redraw on new layer
    let oldLayer = paintLayer;
    paintLayer = createGraphics(width, height);
    paintLayer.pixelDensity(1);
    
    // Redraw background
    if (bgImg && bgImg.width > 0) {
        paintLayer.image(bgImg, 0, 0, width, height);
    } else {
        paintLayer.background(30, 20, 15);
    }
    
    // Note: We can't easily transfer existing splotches because coordinates change.
    // Better to clear them on resize (user can add new ones).
    console.log("Window resized — paint splotches reset");
}

// Keyboard shortcuts
function keyPressed() {
    if (key === 's' || key === 'S') {
        saveCanvas('football_canvas', 'png');
    }
    if (key === 'c' || key === 'C') {
        // Clear all paint splotches
        drawBackgroundToLayer();
    }
}