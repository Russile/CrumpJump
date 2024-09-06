const container = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameWidth = 320;
const gameHeight = 480;

// Load bird images
const crumpImg = new Image();
crumpImg.src = 'crump.png';
const crumpImgUp = new Image();
crumpImgUp.src = 'crump_up.png';
const crumpImgDown = new Image();
crumpImgDown.src = 'crump_down.png';

let currentCrumpImg = crumpImg;

// Load background image
const backgroundImg = new Image();
backgroundImg.src = 'background_pixel.png';
let backgroundX = 0;

let frameCount = 0;

// Game variables
let bird = {
    x: gameWidth * 0.2,
    y: gameHeight * 0.4,
    width: 37.5,  // Increased by 25% from 30
    height: 37.5, // Increased by 25% from 30
    velocity: 0,
    gravity: 0.5,
    jump: -7.4,
    rotation: 0
};

let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let gameOver = false;
let gameStarted = false;
let testMode = false;
let pipesPassed = 0;
let backgroundSpeed = 1;
let pipeSpeed = 2;
const SPEED_INCREASE_AMOUNT = 0.1; // Increase speed by 0.1 each time
const MAX_SPEED = 10; // Maximum speed
const INITIAL_PIPE_SPEED = 2; // Initial pipe speed
const INITIAL_BACKGROUND_SPEED = 1; // Initial background speed
const PIPE_SPACING = 200; // Desired horizontal spacing between pipes in pixels
let lastPipeSpawnX = gameWidth;

// Load pipe images
const pipeImgs = [
    'pipe1.png',
    //'pipe2.png',
    //'pipe3.png',
    'pipe4.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

function createPipe() {
    const gapHeight = 150; // Adjust this value to change difficulty
    const minHeight = 50;
    const maxHeight = gameHeight - gapHeight - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    return {
        x: gameWidth,
        y: topHeight + gapHeight,
        width: 50,
        topHeight: topHeight,
        bottomY: topHeight + gapHeight,
        passed: false,
        img: pipeImgs[Math.floor(Math.random() * pipeImgs.length)]
    };
}

// Add this function to check if a tap is within a button area
function isTapWithinButton(x, y, buttonX, buttonY, buttonWidth, buttonHeight) {
    return x >= buttonX && x <= buttonX + buttonWidth &&
           y >= buttonY && y <= buttonY + buttonHeight;
}

// Add this function to handle both mouse clicks and touch events
function handlePointerEvent(event) {
    event.preventDefault();

    let tapX, tapY;
    
    if (event.type === 'touchstart') {
        // Touch event
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            tapX = touch.clientX;
            tapY = touch.clientY;
        }
    } else {
        // Mouse event
        tapX = event.clientX;
        tapY = event.clientY;
    }

    if (tapX === undefined || tapY === undefined) {
        return; // Exit if we couldn't get valid coordinates
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = gameWidth / rect.width;
    const scaleY = gameHeight / rect.height;
    
    tapX = (tapX - rect.left) * scaleX;
    tapY = (tapY - rect.top) * scaleY;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const startButtonY = gameHeight * 0.6;
    const hardModeButtonY = startButtonY + buttonHeight + buttonSpacing;
    const buttonX = (gameWidth - buttonWidth) / 2;

    if (!gameStarted) {
        if (isTapWithinButton(tapX, tapY, buttonX, startButtonY, buttonWidth, buttonHeight)) {
            startGame(false);
        } else if (hardModeUnlocked && isTapWithinButton(tapX, tapY, buttonX, hardModeButtonY, buttonWidth, buttonHeight)) {
            startGame(true);
        }
    } else if (gameOver) {
        if (Date.now() - gameOverTime >= GAME_OVER_DELAY) {
            if (isTapWithinButton(tapX, tapY, buttonX, startButtonY, buttonWidth, buttonHeight)) {
                restartGame(false);
            } else if (hardModeUnlocked && isTapWithinButton(tapX, tapY, buttonX, hardModeButtonY, buttonWidth, buttonHeight)) {
                restartGame(true);
            }
        }
    } else {
        jump();
    }
}

// Add these new functions to handle game actions
function startGame(hardMode) {
    gameStarted = true;
    hardModeActive = hardMode;
    resetGame(hardMode);
    bird.velocity = bird.jump * INITIAL_JUMP_MULTIPLIER;
}

function restartGame(hardMode) {
    resetGame(hardMode);
    gameStarted = true;
    hardModeActive = hardMode;
    bird.velocity = bird.jump * INITIAL_JUMP_MULTIPLIER;
}

function jump() {
    bird.velocity = bird.jump;
    flapDownFrames = FLAP_DOWN_DURATION;
    flapTransitionFrames = FLAP_TRANSITION_DURATION;
}

// Update event listeners
canvas.addEventListener('touchstart', handlePointerEvent, { passive: false });
canvas.addEventListener('mousedown', handlePointerEvent);

// Modify the keydown event listener
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (!gameStarted) {
            startGame(false);
        } else if (gameOver) {
            if (Date.now() - gameOverTime >= GAME_OVER_DELAY) {
                restartGame(false);
            }
        } else {
            jump();
        }
    } else if (event.key === 'h' || event.key === 'H') {
        testHardMode = !testHardMode;
        hardModeUnlocked = true;
    }
});

// Add these variables at the top of your file with other game variables
let initialJump = true;
const INITIAL_JUMP_MULTIPLIER = 1.25; // Adjust this value as needed
let gameOverTime = 0;
const GAME_OVER_DELAY = 1000; // 1 second delay, adjust as needed

// Add these variables at the top of your file
let hardModeUnlocked = false;
let hardModeActive = false;
const HARD_MODE_UNLOCK_SCORE = 25;
const HARD_MODE_SPEED_MULTIPLIER = 2;
const HARD_MODE_GAP_REDUCTION = 0.8; // 80% of normal gap size

// Add this variable near the top of your file
let testHardMode = false;

// Add this event listener after your existing event listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
        testHardMode = !testHardMode;
        hardModeUnlocked = true;
    }
});

// Add these constants for button dimensions
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 50;

// Modify resetGame function
function resetGame(startInHardMode = false) {
    bird = {
        x: gameWidth * 0.2,
        y: gameHeight * 0.4, // Start bird higher
        width: 37.5,
        height: 37.5,
        velocity: 0,
        gravity: 0.5,
        jump: -7.4,
        rotation: 0
    };
    pipes = [];
    score = 0;
    pipesPassed = 0;
    gameOver = false;
    frameCount = 0;
    backgroundSpeed = INITIAL_BACKGROUND_SPEED;
    pipeSpeed = INITIAL_PIPE_SPEED;
    testMode = false;
    lastFlapDirection = 0;
    flapDownFrames = 0;
    flapTransitionFrames = 0;
    currentCrumpImg = crumpImg; // Start with neutral image
    lastPipeSpawnX = gameWidth;
    // Note: We're not resetting gameStarted to false here

    hardModeActive = startInHardMode;
    if (hardModeActive) {
        backgroundSpeed = INITIAL_BACKGROUND_SPEED * HARD_MODE_SPEED_MULTIPLIER;
        pipeSpeed = INITIAL_PIPE_SPEED * HARD_MODE_SPEED_MULTIPLIER;
    } else {
        backgroundSpeed = INITIAL_BACKGROUND_SPEED;
        pipeSpeed = INITIAL_PIPE_SPEED;
    }
}

// Modify createPipe function
function createPipe() {
    const gapHeight = hardModeActive ? 120 : 150; // Smaller gap in hard mode
    const minHeight = 50;
    const maxHeight = gameHeight - gapHeight - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    return {
        x: gameWidth,
        y: topHeight + gapHeight,
        width: 50,
        topHeight: topHeight,
        bottomY: topHeight + gapHeight,
        passed: false,
        img: pipeImgs[Math.floor(Math.random() * pipeImgs.length)]
    };
}

// Modify the checkCollision function to use circular hitbox
function checkCollision(birdX, birdY, pipeX, pipeTop, pipeBottom) {
    const birdRadius = bird.width * 0.2; // Adjust this factor to make the collision circle smaller
    const birdCenterX = birdX + bird.width / 2;
    const birdCenterY = birdY + bird.height / 2;
    const pipeWidth = 50; // Adjust this to match your pipe width

    // Only check for collision if the bird is horizontally aligned with the pipe
    if (birdCenterX + birdRadius > pipeX && birdCenterX - birdRadius < pipeX + pipeWidth) {
        // Check if bird is too high (colliding with top pipe)
        if (birdCenterY - birdRadius < pipeTop) {
            return true;
        }
        // Check if bird is too low (colliding with bottom pipe)
        if (birdCenterY + birdRadius > pipeBottom) {
            return true;
        }
    }

    return false;
}

function updateHighScore() {
    console.log(`Updating high score. Current score: ${score}, Current high score: ${highScore}`);
    
    // Check for hard mode unlock regardless of high score
    if (score >= HARD_MODE_UNLOCK_SCORE && !hardModeUnlocked) {
        hardModeUnlocked = true;
        localStorage.setItem('hardModeUnlocked', 'true');
        showHardModeUnlockedPopup();
    }

    // Update high score if necessary
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

const FIXED_DELTA_TIME = 1 / 60; // 60 FPS logic update
let lastUpdateTime = 0;

// Add these variables to your game state
let lastFlapDirection = 0; // 0 for neutral, -1 for up, 1 for down
let flapDownFrames = 0;
let flapTransitionFrames = 0;
const FLAP_DOWN_DURATION = 9; 
const FLAP_TRANSITION_DURATION = 2; // Duration for transition to neutral

// Add these variables at the top of your file
let showingUnlockPopup = false;
let popupOpacity = 1;
const POPUP_FADE_DURATION = 1500; // 1.5 seconds
let popupFadeStartTime;

// Load the hard mode unlock image
const hardModeUnlockedImg = new Image();
hardModeUnlockedImg.src = 'hardmodeunlocked.png';

function showHardModeUnlockedPopup() {
    showingUnlockPopup = true;
    popupOpacity = 1;
    popupFadeStartTime = Date.now();
}

function update() {
    if (!gameStarted) return;
    if (gameOver) return;

    frameCount++;

    // Apply gravity and update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Bird animation
    if (flapDownFrames > 0) {
        flapDownFrames--;
        currentCrumpImg = crumpImgDown;
    } else if (flapTransitionFrames > 0) {
        flapTransitionFrames--;
        currentCrumpImg = crumpImg;
    } else {
        if (bird.velocity >= 0) {
            currentCrumpImg = crumpImgUp;
        } else {
            currentCrumpImg = crumpImg;
        }
    }

    // Bird rotation
    if (bird.velocity < 0) {
        bird.rotation = -0.3; // Rotate slightly upwards when jumping
    } else {
        bird.rotation = Math.min(Math.PI / 6, bird.rotation + 0.05); // Gradually rotate downwards, max 30 degrees
    }

    // Update background position
    backgroundX -= backgroundSpeed;
    if (backgroundX <= -backgroundImg.width + 1) {
        backgroundX += backgroundImg.width - 1;
    }

    // Test mode modifications
    if (testMode) {
        // Prevent bird from falling through the bottom of the screen
        if (bird.y + bird.height > gameHeight) {
            bird.y = gameHeight - bird.height;
            bird.velocity = 0;
        }
        // Prevent bird from flying too high
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    } else {
        // Normal mode collision checks
        // Check if bird hits the ground or flies too high
        if (bird.y + bird.height > gameHeight || bird.y < 0) {
            gameOver = true;
            gameOverTime = Date.now(); // Record the time when game over occurs
            updateHighScore();
        }

        // Check for collisions with pipes
        for (let pipe of pipes) {
            if (checkCollision(bird.x, bird.y, pipe.x, pipe.topHeight, pipe.bottomY)) {
                gameOver = true;
                gameOverTime = Date.now(); // Record the time when game over occurs
                updateHighScore();
                break;
            }
        }
    }

    // Move existing pipes and check for passing
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Check if pipe is passed
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;
            pipesPassed++;
            updateHighScore();

            // Increase speed every pipe
            backgroundSpeed = Math.min(backgroundSpeed + SPEED_INCREASE_AMOUNT, MAX_SPEED);
            pipeSpeed = Math.min(pipeSpeed + SPEED_INCREASE_AMOUNT, MAX_SPEED);
        }

        // Remove pipe if it's off screen
        if (pipe.x < -pipe.width) {
            pipes.splice(i, 1);
        }
    }

    // Spawn new pipes based on the last pipe's position
    if (lastPipeSpawnX - pipeSpeed <= gameWidth - PIPE_SPACING) {
        pipes.push(createPipe());
        lastPipeSpawnX = gameWidth;
    } else {
        lastPipeSpawnX -= pipeSpeed;
    }

    // Check for hard mode unlock in the main update loop
    if (score >= HARD_MODE_UNLOCK_SCORE && !hardModeUnlocked) {
        hardModeUnlocked = true;
        localStorage.setItem('hardModeUnlocked', 'true');
        showHardModeUnlockedPopup();
    }
}

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    // Update game state at a fixed time step
    while (currentTime - lastUpdateTime >= FIXED_DELTA_TIME * 1000) {
        update();
        lastUpdateTime += FIXED_DELTA_TIME * 1000;
    }

    // Render as often as possible
    draw();
}

// Load title logo image
const titleLogoImg = new Image();
titleLogoImg.src = 'crumpjump_title_logo.png';

// Draw game elements
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw scrolling background with 1px overlap
    ctx.drawImage(backgroundImg, Math.floor(backgroundX), 0);
    ctx.drawImage(backgroundImg, Math.floor(backgroundX) + backgroundImg.width - 1, 0);

    if (!gameStarted) {
        // Draw start screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        // Draw title logo image
        const logoAspectRatio = 640 / 428; // width / height
        const maxLogoWidth = gameWidth * 0.8; // 80% of game width
        const maxLogoHeight = gameHeight * 0.4; // 40% of game height

        let logoWidth = maxLogoWidth;
        let logoHeight = logoWidth / logoAspectRatio;

        if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = logoHeight * logoAspectRatio;
        }

        const logoX = (gameWidth - logoWidth) / 2;
        const logoY = gameHeight * 0.15; // Adjust this value to position the logo vertically

        ctx.drawImage(titleLogoImg, logoX, logoY, logoWidth, logoHeight);

        // Draw "Start" button
        const buttonWidth = 150;
        const buttonHeight = 50;
        const buttonSpacing = 20;
        const startButtonY = gameHeight * 0.6;
        const buttonX = (gameWidth - buttonWidth) / 2;

        drawButton(buttonX, startButtonY, buttonWidth, buttonHeight, 'Start', 'rgba(0, 255, 0, 0.6)', 'white');

        if (hardModeUnlocked) {
            // Draw "Hard Mode" button
            const hardModeButtonY = startButtonY + buttonHeight + buttonSpacing;
            drawButton(buttonX, hardModeButtonY, buttonWidth, buttonHeight, 'Hard Mode', 'rgba(255, 0, 0, 0.6)', 'white');
        }

        return;  // Don't draw anything else
    }

    // Draw bird with rotation and current image
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    ctx.drawImage(
        currentCrumpImg,
        0, 0, 200, 200,  // Source rectangle (full image)
        -bird.width / 2, -bird.height / 2, bird.width, bird.height  // Destination rectangle (scaled)
    );
    ctx.restore();

    // Draw pipes
    pipes.forEach(pipe => {
        const pipeWidth = pipe.width;
        const pipeImgWidth = pipe.img.width;
        const pipeImgHeight = pipe.img.height;

        // Draw top pipe (flipped upside down)
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.topHeight / 2);
        ctx.scale(1, -1);
        ctx.drawImage(
            pipe.img,
            0, 0, pipeImgWidth, pipe.topHeight, // source rectangle
            -pipeWidth / 2, -pipe.topHeight / 2, pipeWidth, pipe.topHeight // destination rectangle
        );
        ctx.restore();

        // Draw bottom pipe
        ctx.drawImage(
            pipe.img,
            0, 0, pipeImgWidth, gameHeight - pipe.bottomY, // source rectangle
            pipe.x, pipe.bottomY, pipeWidth, gameHeight - pipe.bottomY // destination rectangle
        );
    });

    // Draw score - align left
    drawTextWithOutline(`Score: ${score}`, 10, 24, '#FFD700', 'black', 2, '24px', 'bold', 'left', 'top');

    // Draw high score - align left
    drawTextWithOutline(`High Score: ${highScore}`, 10, 48, '#FFFFFF', 'black', 2, '20px', 'normal', 'left', 'top');

    // Draw speed meter
    const SPEED_METER_WIDTH = 100;
    const SPEED_METER_HEIGHT = 10;
    const SPEED_METER_MARGIN = 10;
    const speedPercentage = (pipeSpeed - INITIAL_PIPE_SPEED) / (MAX_SPEED - INITIAL_PIPE_SPEED);
    const meterFillWidth = speedPercentage * SPEED_METER_WIDTH;

    // Position speed meter at bottom left
    const meterX = SPEED_METER_MARGIN;

    // Draw meter background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(meterX, gameHeight - SPEED_METER_MARGIN - SPEED_METER_HEIGHT, SPEED_METER_WIDTH, SPEED_METER_HEIGHT);

    // Draw meter fill
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fillRect(meterX, gameHeight - SPEED_METER_MARGIN - SPEED_METER_HEIGHT, meterFillWidth, SPEED_METER_HEIGHT);

    // Draw meter border
    ctx.strokeStyle = 'white';
    ctx.strokeRect(meterX, gameHeight - SPEED_METER_MARGIN - SPEED_METER_HEIGHT, SPEED_METER_WIDTH, SPEED_METER_HEIGHT);

    // Draw speed label
    drawTextWithOutline('Speed', meterX, gameHeight - SPEED_METER_MARGIN - SPEED_METER_HEIGHT - 5, 'white', 'black', 2, '20px', 'normal', 'left', 'bottom');

    if (gameOver) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Game Over text
        drawTextWithOutline('Game Over', gameWidth / 2, gameHeight * 0.3, '#FF4136', 'black', 3, '48px', 'bold', 'center', 'middle');

        // Score and High Score
        drawTextWithOutline(`Score: ${score}`, gameWidth / 2, gameHeight * 0.45, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');
        drawTextWithOutline(`High Score: ${highScore}`, gameWidth / 2, gameHeight * 0.55, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');

        if (Date.now() - gameOverTime < GAME_OVER_DELAY) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, gameHeight - 5, (Date.now() - gameOverTime) / GAME_OVER_DELAY * gameWidth, 5);
        } else {
            // Draw "Restart" button
            const buttonWidth = 150;
            const buttonHeight = 50;
            const buttonSpacing = 20;
            const restartButtonY = gameHeight * 0.6;
            const buttonX = (gameWidth - buttonWidth) / 2;

            drawButton(buttonX, restartButtonY, buttonWidth, buttonHeight, 'Restart', 'rgba(0, 255, 0, 0.6)', 'white');

            if (hardModeUnlocked) {
                // Draw "Hard Mode" button
                const hardModeButtonY = restartButtonY + buttonHeight + buttonSpacing;
                drawButton(buttonX, hardModeButtonY, buttonWidth, buttonHeight, 'Hard Mode', 'rgba(255, 0, 0, 0.6)', 'white');
            }
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // Display Test Mode indicator and diagnostic information if active
    if (testMode) {
        drawTextWithOutline('Test Mode', 10, gameHeight - 10, '#4CAF50', 'black', 2, '20px', 'bold', 'left', 'bottom');

        // Diagnostic information
        let yPos = 70;
        [
            `Background X: ${backgroundX.toFixed(2)}`,
            `Bird Y: ${bird.y.toFixed(2)}`,
            `Bird Velocity: ${bird.velocity.toFixed(2)}`,
            `Pipes: ${pipes.length}`,
            `Pipes Passed: ${pipesPassed}`,
            `Pipe Speed: ${pipeSpeed.toFixed(2)}`,
            `Frame Count: ${frameCount}`,
            pipes.length > 0 ? `First Pipe X: ${pipes[0].x.toFixed(2)}` : ''
        ].forEach(text => {
            drawTextWithOutline(text, 10, yPos, 'white', 'black', 2, '20px');
            yPos += 20;
        });
    }

    // Move Hard Mode indicator to bottom right
    if (hardModeActive) {
        drawTextWithOutline('HARD MODE', gameWidth - 10, gameHeight - 10, '#FF4136', 'black', 2, '24px', 'bold', 'right', 'bottom');
    }

    // Display Test Hard Mode indicator if active (also moved to bottom right)
    if (testHardMode) {
        drawTextWithOutline('Test Hard Mode', gameWidth - 10, gameHeight - 30, '#FF4136', 'black', 2, '20px', 'bold', 'right', 'bottom');
    }

    // Always check if we should show the popup
    if (showingUnlockPopup) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - popupFadeStartTime;
        
        if (elapsedTime < POPUP_FADE_DURATION) {
            popupOpacity = 1 - (elapsedTime / POPUP_FADE_DURATION);
            
            ctx.globalAlpha = popupOpacity;
            const popupWidth = gameWidth * 0.8;
            const popupHeight = popupWidth * (hardModeUnlockedImg.height / hardModeUnlockedImg.width);
            const popupX = (gameWidth - popupWidth) / 2;
            const popupY = (gameHeight - popupHeight) / 2;
            
            ctx.drawImage(hardModeUnlockedImg, popupX, popupY, popupWidth, popupHeight);
            ctx.globalAlpha = 1;
        } else {
            showingUnlockPopup = false;
        }
    }

    // Draw bird collision circle (for debugging)
    if (window.debugMode) {
        const birdRadius = bird.width * 0.2;
        const birdCenterX = bird.x + bird.width / 2;
        const birdCenterY = bird.y + bird.height / 2;
        ctx.beginPath();
        ctx.arc(birdCenterX, birdCenterY, birdRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }
}

const GAME_FONT = "'VT323', monospace";

// Update the drawTextWithOutline function
function drawTextWithOutline(text, x, y, fillStyle, strokeStyle, lineWidth, fontSize = '20px', fontWeight = 'normal', align = 'left', baseline = 'top') {
    ctx.font = `${fontWeight} ${fontSize} ${GAME_FONT}`;
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    x = Math.round(x);
    y = Math.round(y);
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

// Update the drawButton function
function drawButton(x, y, width, height, text, fillColor, textColor, fontSize = '24px') {
    // Draw button background with rounded corners
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10); // 10 is the corner radius, adjust as needed
    ctx.fill();

    // Draw button border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw button text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize} ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
}

// Ensure all images are loaded before starting the game
Promise.all([
    ...pipeImgs.map(img => img.decode()),
    crumpImg.decode(),
    crumpImgUp.decode(),
    crumpImgDown.decode(),
    backgroundImg.decode(),
    titleLogoImg.decode(),
    hardModeUnlockedImg.decode()
]).then(() => {
    // Start the game loop
    lastUpdateTime = performance.now();
    requestAnimationFrame(gameLoop);
}).catch(err => {
    console.error("Error loading images:", err);
});

// Set canvas size to fit the container
function resizeCanvas() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scale = Math.min(containerWidth / gameWidth, containerHeight / gameHeight);
    
    canvas.style.width = `${gameWidth * scale}px`;
    canvas.style.height = `${gameHeight * scale}px`;
    
    // Adjust for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = gameWidth * scale * dpr;
    canvas.height = gameHeight * scale * dpr;
    
    ctx.scale(scale * dpr, scale * dpr);
}

// Call resizeCanvas initially and on window resize 
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Add this to your initialization code
hardModeUnlocked = localStorage.getItem('hardModeUnlocked') === 'true';

// Make sure to call resetGame() when initializing your game
resetGame();

// Developer tools
window.devTools = {
    resetHighScore: function() {
        highScore = 0;
        localStorage.setItem('highScore', '0');
        console.log('High score reset to 0');
    },
    toggleHardMode: function() {
        hardModeUnlocked = !hardModeUnlocked;
        localStorage.setItem('hardModeUnlocked', hardModeUnlocked.toString());
        console.log(`Hard mode ${hardModeUnlocked ? 'unlocked' : 'locked'}`);
    },
    setScore: function(newScore) {
        score = newScore;
        console.log(`Score set to ${newScore}`);
    },
    toggleDebugMode: function() {
        window.debugMode = !window.debugMode;
        console.log(`Debug mode ${window.debugMode ? 'enabled' : 'disabled'}`);
    }
};