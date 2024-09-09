const container = document.getElementById('gameContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameWidth = 320;
const gameHeight = 480;

const TOTAL_CHARACTERS = 3;
let currentCharacterIndex = 'crump1'; // Start with crump1 by default
const characterNames = {
    crump0: 'CRUMPLESTILTSKIN',
    crump1: 'CRUMP',
    crump2: 'STASH',
    crump3: 'GOOGINI'
    // Add more character names as needed
};
// Add this new array to store character images
const characterImages = [];

// Define unlock conditions
const unlockConditions = {
    crump0: { mode: 'Hard', score: 20 },
    crump2: { mode: 'Normal', score: 30 },
    crump3: { mode: 'Normal', score: 50 }
    // Add more characters and their unlock conditions here
};

function getUnlockCondition(character) {
    const condition = unlockConditions[character];
    if (condition) {
        return `Score ${condition.score} in ${condition.mode} Mode`;
    } else if (character === 'crump1') {
        return 'Always Unlocked';
    } else {
        return 'Locked';
    }
}
let unlockedCharacters = {};
const ALWAYS_UNLOCKED_CHARACTER = 'crump1';

function getCharacterFolders() {
    return ['crump0', 'crump1', 'crump2', 'crump3'
    ]; 
}

function initializeCharacters() {
    const characterFolders = getCharacterFolders();

    characterFolders.forEach((folder) => {
        // Only initialize if it's in unlockConditions or it's the always unlocked character
        if (unlockConditions[folder] || folder === ALWAYS_UNLOCKED_CHARACTER) {
            characterImages[folder] = {
                neutral: new Image(),
                up: new Image(),
                down: new Image()
            };
            characterImages[folder].neutral.src = `assets/characters/${folder}/${folder}.png`;
            characterImages[folder].up.src = `assets/characters/${folder}/${folder}_up.png`;
            characterImages[folder].down.src = `assets/characters/${folder}/${folder}_down.png`;
        }
    });

    console.log('Initialized characters:', unlockedCharacters);
}

function updateCharacterImages() {
    if (characterImages[currentCharacterIndex]) {
        currentCrumpImg = characterImages[currentCharacterIndex].neutral;
        crumpImgUp = characterImages[currentCharacterIndex].up;
        crumpImgDown = characterImages[currentCharacterIndex].down;
    } else {
        console.error('Current character not found:', currentCharacterIndex);
        // Set to default character if current one is not found
        currentCharacterIndex = ALWAYS_UNLOCKED_CHARACTER;
        updateCharacterImages();
    }
}

function switchCharacter(direction) {
    let availableCharacters = Object.keys(unlockedCharacters).filter(char => unlockedCharacters[char]);
    let currentIndex = availableCharacters.indexOf(currentCharacterIndex);
    currentIndex = (currentIndex + direction + availableCharacters.length) % availableCharacters.length;
    currentCharacterIndex = availableCharacters[currentIndex];
    updateCharacterImages();
}

let showingUnlockNotification = false;
let unlockNotificationText = '';
let unlockNotificationTimer = null;

function showUnlockNotification(characterName) {
    showingUnlockNotification = true;
    unlockNotificationText = `${characterName} Unlocked!`;
    
    // Clear any existing timer
    if (unlockNotificationTimer) {
        clearTimeout(unlockNotificationTimer);
    }
    
    // Set a timer to hide the notification after 3 seconds
    unlockNotificationTimer = setTimeout(() => {
        showingUnlockNotification = false;
        unlockNotificationTimer = null;
    }, 3000);
}

function checkAllCharacterUnlocks() {
    Object.entries(unlockConditions).forEach(([character, condition]) => {
        if (!unlockedCharacters[character]) {
            const relevantScore = condition.mode === 'Hard' ? hardModeHighScore : normalModeHighScore;
            if (relevantScore >= condition.score) {
                unlockedCharacters[character] = true;
                console.log(`Unlocked ${character} based on existing high score!`);
            }
        }
    });
    saveUnlockedCharacters();
}

function loadHighScores() {
    normalModeHighScore = parseInt(localStorage.getItem('normalModeHighScore')) || 0;
    hardModeHighScore = parseInt(localStorage.getItem('hardModeHighScore')) || 0;
    checkAllCharacterUnlocks(); // Add this line
}

// Make sure to call this when your game initializes
function initGame() {
    loadUnlockedCharacters();
    initializeCharacters();    
    // Ensure the current character is unlocked
    if (!unlockedCharacters[currentCharacterIndex]) {
        currentCharacterIndex = ALWAYS_UNLOCKED_CHARACTER;
    }
    updateCharacterImages();
    loadHighScores();
    checkAllCharacterUnlocks();
}



// Load background image
const backgroundImg = new Image();
backgroundImg.src = 'background_pixel.png';
let backgroundX = 0;

let frameCount = 0;

// Game variables
let bird = {
    x: gameWidth * 0.2,
    y: gameHeight * 0.4,
    width: 43.125,  // Increased by 15% from 37.5
    height: 43.125, // Increased by 15% from 37.5
    velocity: 0,
    gravity: 0.5,
    jump: -7.4,
    rotation: 0
};

let pipes = [];
let score = 0;
let normalModeHighScore = parseInt(localStorage.getItem('normalModeHighScore')) || 0;
let hardModeHighScore = parseInt(localStorage.getItem('hardModeHighScore')) || 0;
let gameOver = false;
let gameStarted = false;
let debugMode = false;
let pipesPassed = 0;
let backgroundSpeed = 1;
let pipeSpeed = 2;
const SPEED_INCREASE_AMOUNT = 0.1; // Increase speed by 0.1 each time
const MAX_SPEED = 10; // Maximum speed
const INITIAL_PIPE_SPEED = 2; // Initial pipe speed
const INITIAL_BACKGROUND_SPEED = 1; // Initial background speed
const PIPE_SPACING = 200; // Desired horizontal spacing between pipes in pixels
let lastPipeSpawnX = gameWidth;

// Boost variables
let boosting = false;
let lastJumpTime = 0;
let boostLevel = 0;
const MAX_BOOST_LEVEL = 2; // 0, 1, 2 (three levels total)
const BASE_BOOST_MULTIPLIER = 1.35;
const BOOST_INCREMENT = 0.2;
const BOOST_THRESHOLD = 300; // Adjust this value as needed (in milliseconds)

// Flap animation variables
let lastFlapDirection = 0; // 0 for neutral, -1 for up, 1 for down
let flapDownFrames = 0;
let flapTransitionFrames = 0;
const FLAP_DOWN_DURATION = 9; 
const FLAP_TRANSITION_DURATION = 2; // Duration for transition to neutral

// Call this when your game starts
initGame();

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

function drawCharacterSelection(x, y, width, height) {
    const characterFolders = getCharacterFolders();
    const currentIndex = characterFolders.indexOf(currentCharacterIndex);

    // Draw character
    if (characterImages[currentCharacterIndex]) {
        const img = characterImages[currentCharacterIndex].up;
        if (img.complete) {
            // Calculate scaling to fit the image within the given dimensions
            const scale = Math.min(width / img.width, height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = (width - scaledWidth) / 2;
            const offsetY = (height - scaledHeight) / 2;

            ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
        } else {
            // Draw placeholder if image is not loaded
            ctx.fillStyle = 'gray';
            ctx.fillRect(x, y, width, height);
        }
    }

    if (!unlockedCharacters[currentCharacterIndex]) {
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Draw lock icon
        ctx.fillStyle = 'white';
        ctx.font = `${width * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', x + width / 2, y + height / 2);
    }

    if (!unlockedCharacters[currentCharacterIndex]) {
        // Draw semi-transparent overlay and lock icon for locked characters
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        ctx.fillStyle = 'white';
        ctx.font = `${width * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', x + width / 2, y + height / 2);
    }

    // Draw arrow buttons
    const arrowWidth = 30;
    const arrowHeight = 30;
    const arrowY = y + height / 2 - arrowHeight / 2;

    // Left arrow
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x - arrowWidth - 10, arrowY + arrowHeight / 2);
    ctx.lineTo(x - 10, arrowY);
    ctx.lineTo(x - 10, arrowY + arrowHeight);
    ctx.closePath();
    ctx.fill();

    // Right arrow
    ctx.beginPath();
    ctx.moveTo(x + width + arrowWidth + 10, arrowY + arrowHeight / 2);
    ctx.lineTo(x + width + 10, arrowY);
    ctx.lineTo(x + width + 10, arrowY + arrowHeight);
    ctx.closePath();
    ctx.fill();

    // Draw character name
    ctx.fillStyle = 'white';
    ctx.font = `20px ${GAME_FONT}`; // Updated to use GAME_FONT
    ctx.textAlign = 'center';
    const name = characterNames[currentCharacterIndex] || currentCharacterIndex;
    ctx.fillText(name, x + width / 2, y + height + 10);
    
    // Draw unlock condition
    if (!unlockedCharacters[currentCharacterIndex]) {
        ctx.fillStyle = 'yellow';
        ctx.font = `14px ${GAME_FONT}`; // Updated to use GAME_FONT
        ctx.fillText(getUnlockCondition(currentCharacterIndex), x + width / 2, y + height + 25);
    }
}



function switchCharacter(direction) {
    const characterFolders = getCharacterFolders();
    let currentIndex = characterFolders.indexOf(currentCharacterIndex);
    currentIndex = (currentIndex + direction + characterFolders.length) % characterFolders.length;
    currentCharacterIndex = characterFolders[currentIndex];
    updateCharacterImages();
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
   
    // Check if instructions are showing
    if (showingInstructions) {
        showingInstructions = false;
        console.log('Instructions hidden');
        draw(); // Force an immediate redraw
        return; // Exit the function to prevent other clicks
    }
    
    // Check if the question mark was clicked (do this check first)
    if (isQuestionMarkClicked(tapX, tapY)) {
        showingInstructions = !showingInstructions;
        console.log(`Toggled instructions: ${showingInstructions}`); // Debug log
        draw(); // Force an immediate redraw
        return;
    }

    // Check for logo clicks on the start screen
    if (!gameStarted) {
        const logoWidth = gameWidth * 0.8;
        const logoHeight = logoWidth / (640 / 428);
        const logoX = (gameWidth - logoWidth) / 2;
        const logoY = gameHeight * 0.05;

        if (isTapWithinButton(tapX, tapY, logoX, logoY, logoWidth, logoHeight)) {
            handleLogoClick();
            return;
        }
    }

    // Check for character selection clicks
    if (!gameStarted || gameOver) {
        const characterWidth = gameWidth * 0.2;
        const characterHeight = characterWidth;
        const characterX = (gameWidth - characterWidth) / 2;
        const characterY = gameHeight * 0.45;

        // In the character selection click handling part:
        if (isTapWithinButton(tapX, tapY, characterX - 40, characterY + characterHeight / 2 - 15, 30, 30)) {
            switchCharacter(-1);
            return;
        }

        if (isTapWithinButton(tapX, tapY, characterX + characterWidth + 10, characterY + characterHeight / 2 - 15, 30, 30)) {
            switchCharacter(1);
            return;
        }
    }
    
    const buttonWidth = 140; // Match the new button width
    const buttonHeight = buttonWidth * (200 / 480);
    const buttonSpacing = 15;
    const bottomMargin = 30;
    const hardModeButtonY = gameHeight - bottomMargin - buttonHeight;
    const normalModeButtonY = hardModeButtonY - buttonHeight - buttonSpacing;
    const buttonX = (gameWidth - buttonWidth) / 2;

    if (!gameStarted) {
        if (isTapWithinButton(tapX, tapY, buttonX, normalModeButtonY, buttonWidth, buttonHeight)) {
            if (unlockedCharacters[currentCharacterIndex]) {
                startGame(false); // Normal Mode
            } else {
                console.log("This character is locked. Please select an unlocked character.");
                // You could also display this message on the canvas
            }
        } else if (hardModeUnlocked && isTapWithinButton(tapX, tapY, buttonX, hardModeButtonY, buttonWidth, buttonHeight)) {
            if (unlockedCharacters[currentCharacterIndex]) {
                startGame(true); // Hard Mode
            } else {
                console.log("This character is locked. Please select an unlocked character.");
                // You could also display this message on the canvas
            }
        }
    } else if (gameOver) {
        if (Date.now() - gameOverTime >= GAME_OVER_DELAY) {
            if (isTapWithinButton(tapX, tapY, buttonX, normalModeButtonY, buttonWidth, buttonHeight)) {
                if (unlockedCharacters[currentCharacterIndex]) {
                    startGame(false); // Normal Mode
                } else {
                    console.log("This character is locked. Please select an unlocked character.");
                    // Optionally, show a message on screen
                    showLockedCharacterMessage();
                }
            } else if (hardModeUnlocked && isTapWithinButton(tapX, tapY, buttonX, hardModeButtonY, buttonWidth, buttonHeight)) {
                if (unlockedCharacters[currentCharacterIndex]) {
                    startGame(true); // Hard Mode
                } else {
                    console.log("This character is locked. Please select an unlocked character.");
                    // Optionally, show a message on screen
                    showLockedCharacterMessage();
                }
            }
        }
    } else {
        jump();
    }

    if (debugMode) {
        const resetButtonWidth = 100;
        const resetButtonHeight = 40;
        const resetButtonX = gameWidth - resetButtonWidth - 10;
        const resetButtonY = 10;

        if (isTapWithinButton(tapX, tapY, resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight)) {
            resetAllVariables();
            return;
        }
    }

    if (!gameStarted || gameOver) {
        showCursor(); // Ensure cursor is visible on start and game over screens
    } else {
        hideCursor(); // Hide cursor during gameplay
    }
}

function showLockedCharacterMessage() {
    // This function will display a message on screen
    // You can implement it similar to how you show other temporary messages
    let messageTimer = null;
    const message = "Character locked! Select an unlocked character.";
    
    // Draw the message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, gameHeight / 2 - 30, gameWidth, 60);
    ctx.fillStyle = 'white';
    ctx.font = `16px ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, gameWidth / 2, gameHeight / 2);
    
    // Clear the message after a delay
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        // Redraw the game over screen to clear the message
        draw();
    }, 2000);
}

// Add these new functions to handle game actions
function startGame(hardMode) {
    gameStarted = true;
    hardModeActive = hardMode;
    resetGame(hardMode);
    bird.velocity = bird.jump * INITIAL_JUMP_MULTIPLIER;
    canvas.classList.add('playing'); // Add this line
    hideCursor(); // Hide cursor when game starts
}

function restartGame(hardMode) {
    resetGame(hardMode);
    gameStarted = true;
    hardModeActive = hardMode;
    bird.velocity = bird.jump * INITIAL_JUMP_MULTIPLIER;
}

function jump() {
    const currentTime = Date.now();
    if (currentTime - lastJumpTime < BOOST_THRESHOLD) {
        // Boost jump
        boostLevel = Math.min(boostLevel + 1, MAX_BOOST_LEVEL);
        const currentBoostMultiplier = BASE_BOOST_MULTIPLIER + (BOOST_INCREMENT * boostLevel);
        bird.velocity = bird.jump * currentBoostMultiplier;
        boosting = true;
    } else {
        // Normal jump
        bird.velocity = bird.jump;
        boosting = false;
        boostLevel = 0; // Reset boost level for normal jumps
    }
    lastJumpTime = currentTime;

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
            startGame(false); // Start in Normal Mode
        } else if (gameOver) {
            if (Date.now() - gameOverTime >= GAME_OVER_DELAY) {
                restartGame(hardModeActive); // Restart in the current mode
            }
        } else {
            jump();
        }
    } else if (event.key === 'h' || event.key === 'H') {
        hardModeUnlocked = !hardModeUnlocked;
        localStorage.setItem('hardModeUnlocked', hardModeUnlocked.toString());
        if (hardModeUnlocked) {
            showHardModeUnlockedPopup();
        } else {
            showingUnlockPopup = false;
        }
        console.log(`Hard mode ${hardModeUnlocked ? 'unlocked' : 'locked'}`);
    } else if (event.key === 's' || event.key === 'S') {
        normalModeHighScore = 0;
        hardModeHighScore = 0;
        localStorage.setItem('normalModeHighScore', '0');
        localStorage.setItem('hardModeHighScore', '0');
        console.log('Normal and Hard Mode High Scores reset to 0');
    } else if (event.key === 'd' || event.key === 'D') {
        toggleDebugMode();
    }
});

// Add these variables at the top of your file with other game variables
let initialJump = true;
const INITIAL_JUMP_MULTIPLIER = 1.15; // Adjust this value as needed
let gameOverTime = 0;
const GAME_OVER_DELAY = 1000; // 1 second delay, adjust as needed

// Add these variables at the top of your file with other game variables
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
        width: 43.125, // Increased by 15% from 37.5
        height: 43.125, // Increased by 15% from 37.5
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
    currentCrumpImg = characterImages[currentCharacterIndex].neutral;
    crumpImgUp = characterImages[currentCharacterIndex].up;
    crumpImgDown = characterImages[currentCharacterIndex].down;
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

    showingUnlockPopup = false; // Reset the popup visibility
    canvas.classList.remove('playing'); // Add this line

    if (!gameStarted || gameOver) {
        showCursor(); // Show cursor on start screen and game over screen
    } else {
        hideCursor(); // Hide cursor during gameplay
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
    const birdRadius = bird.width * 0.23; // Adjusted for the 15% increase (0.2 * 1.15)
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
    if (hardModeActive) {
        if (score > hardModeHighScore) {
            hardModeHighScore = score;
            localStorage.setItem('hardModeHighScore', hardModeHighScore.toString());
            checkCharacterUnlocks();
            checkAllCharacterUnlocks(); // Add this line
        }
    } else {
        if (score > normalModeHighScore) {
            normalModeHighScore = score;
            localStorage.setItem('normalModeHighScore', normalModeHighScore.toString());
            checkCharacterUnlocks();
            checkAllCharacterUnlocks(); // Add this line
        }
    }
}

function checkCharacterUnlocks() {
    let newUnlocks = false;
    Object.entries(unlockConditions).forEach(([character, condition]) => {
        if (!unlockedCharacters[character]) {
            const relevantScore = condition.mode === 'Hard' ? hardModeHighScore : normalModeHighScore;
            if (relevantScore >= condition.score) {
                unlockedCharacters[character] = true;
                showUnlockNotification(characterNames[character]);
                newUnlocks = true;
                console.log(`Unlocked ${character}!`);
            }
        }
    });
    if (newUnlocks) {
        saveUnlockedCharacters();
    }
}

function drawUnlockNotification() {
    if (showingUnlockNotification) {
        ctx.font = `16px ${GAME_FONT}`;
        const textWidth = ctx.measureText(unlockNotificationText).width;
        const padding = 20;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = 40;
        const boxX = (gameWidth - boxWidth) / 2; // Center horizontally
        const boxY = 10; // 10px from top

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(unlockNotificationText, gameWidth / 2, boxY + boxHeight / 2);
    }
}

function saveUnlockedCharacters() {
    localStorage.setItem('unlockedCharacters', JSON.stringify(unlockedCharacters));
}

function loadUnlockedCharacters() {
    const saved = localStorage.getItem('unlockedCharacters');
    if (saved) {
        unlockedCharacters = JSON.parse(saved);
    }
    
    // Ensure all characters from unlockConditions are initialized
    Object.keys(unlockConditions).forEach(character => {
        if (unlockedCharacters[character] === undefined) {
            unlockedCharacters[character] = false;
        }
    });

    // Always ensure the default character is unlocked
    unlockedCharacters[ALWAYS_UNLOCKED_CHARACTER] = true;
}

function showUnlockMessage(character) {
    // Implement a function to show a message when a new character is unlocked
    console.log(`Unlocked ${character}!`);
    // You can add code here to display a message on the screen
}

const FIXED_DELTA_TIME = 1 / 60; // 60 FPS logic update
let lastUpdateTime = 0;



// Add these variables at the top of your file
let showingUnlockPopup = false;

// Load the hard mode unlock image
const hardModeUnlockedImg = new Image();
hardModeUnlockedImg.src = 'hardmodeunlocked.png';

// Load the hard mode active image
const hardModeActiveImg = new Image();
hardModeActiveImg.src = 'hardmode.png';

// Add these lines near the top of your file where you load other images
const normalModeImg = new Image();
normalModeImg.src = 'normalmode.png';

function showHardModeUnlockedPopup() {
    showingUnlockPopup = true;
}

function hideHardModeUnlockedPopup() {
    showingUnlockPopup = false;
}

// Add this near the top of your file
let logoClickCount = 0;
let lastLogoClickTime = 0;
const LOGO_CLICK_THRESHOLD = 1000; // 1 second
const LOGO_CLICKS_REQUIRED = 5;

// Add this new function
function handleLogoClick() {
    const currentTime = Date.now();
    if (currentTime - lastLogoClickTime < LOGO_CLICK_THRESHOLD) {
        logoClickCount++;
        if (logoClickCount >= LOGO_CLICKS_REQUIRED) {
            toggleDebugMode();
            logoClickCount = 0;
        }
    } else {
        logoClickCount = 1;
    }
    lastLogoClickTime = currentTime;
    console.log(`Logo clicked. Count: ${logoClickCount}`); // Add this line for debugging
}

function resetAllVariables() {
    normalModeHighScore = 0;
    hardModeHighScore = 0;
    hardModeUnlocked = false;
    localStorage.setItem('normalModeHighScore', '0');
    localStorage.setItem('hardModeHighScore', '0');
    localStorage.setItem('hardModeUnlocked', 'false');

    // Reset unlocked characters
    const characterFolders = getCharacterFolders();
    unlockedCharacters = {};
    characterFolders.forEach(character => {
        unlockedCharacters[character] = (character === 'crump1');  // Only crump1 is unlocked
    });
    localStorage.setItem('unlockedCharacters', JSON.stringify(unlockedCharacters));

    // Reset current character to the default unlocked one
    currentCharacterIndex = 'crump1';
    updateCharacterImages();

    console.log('All variables reset, including unlocked characters');
    showResetMessage();
    resetGame(); // Add this line to reset the game state
}

// Add this function to show a reset message
function showResetMessage() {
    const message = 'All data reset!';
    const originalFillStyle = ctx.fillStyle;
    const originalFont = ctx.font;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '24px ' + GAME_FONT;
    const messageWidth = ctx.measureText(message).width;

    const messageX = (gameWidth - messageWidth) / 2;
    const messageY = gameHeight * 0.7;

    ctx.fillRect(messageX - 10, messageY - 30, messageWidth + 20, 40);
    ctx.fillStyle = 'black';
    ctx.fillText(message, messageX, messageY);

    // Restore original context settings
    ctx.fillStyle = originalFillStyle;
    ctx.font = originalFont;

    // Remove the message after 2 seconds
    setTimeout(() => {
        // Redraw the start screen
        draw();
    }, 2000);
}

// Add these variables near the top of your file with other game variables
let showingInstructions = false;
const INSTRUCTION_TEXT = "Tap to Jump\nQuick Tap to Boost\n\nHard Mode:\nScore 25 Points to Unlock\n +20% Start Speed\n -10% Gap Size";

// Add this function to draw the yellow "?" symbol
function drawQuestionMark() {
    const size = 40;
    const x = gameWidth - size - 10;
    const y = 10;
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'yellow';
    ctx.font = `bold ${size}px ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x + size/2, y + size/2);
}

// Add this function to check if the question mark was clicked
function isQuestionMarkClicked(tapX, tapY) {
    const size = 50;
    const x = gameWidth - size - 10;
    const y = 10;
    
    const centerX = x + size/2;
    const centerY = y + size/2;
    const radius = size/2;
    
    const distance = Math.sqrt((tapX - centerX) ** 2 + (tapY - centerY) ** 2);
    const clicked = distance <= radius;
    
    console.log(`Question mark clicked: ${clicked}. Tap coordinates: (${tapX}, ${tapY})`);
    
    return clicked;
}

// Helper function to wrap text and return an array of lines
function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function drawInstructionsPopup() {
    const padding = 20;
    const borderRadius = 10;
    const maxWidth = gameWidth * 0.8;
    const fontSize = 20;
    const lineHeight = fontSize * 1.2; // Adjust this for desired spacing

    ctx.font = `${fontSize}px ${GAME_FONT}`;
    
    // Split the instruction text into lines
    const lines = INSTRUCTION_TEXT.split('\n');
    
    let totalHeight = lines.length * lineHeight;
    let maxTextWidth = 0;

    lines.forEach(line => {
        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxTextWidth) maxTextWidth = lineWidth;
    });

    const boxWidth = Math.min(maxTextWidth + padding * 2, maxWidth);
    const boxHeight = totalHeight + padding * 2;
    const boxX = (gameWidth - boxWidth) / 2;
    const boxY = (gameHeight - boxHeight) / 2;

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Draw box
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center'; // Center text alignment
    ctx.textBaseline = 'middle'; // Align to middle of line height

    let currentY = boxY + padding + lineHeight / 2; // Start at half a line height
    const centerX = boxX + boxWidth / 2; // Center of the box

    lines.forEach(line => {
        ctx.fillText(line, centerX, currentY);
        currentY += lineHeight;
    });
}

// Modify the draw function to include the developer mode features
function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw scrolling background with 1px overlap
    ctx.drawImage(backgroundImg, Math.floor(backgroundX), 0);
    ctx.drawImage(backgroundImg, Math.floor(backgroundX) + backgroundImg.width - 1, 0);

    if (!gameStarted) {
        console.log('Drawing start screen'); // Debug log
        // Draw start screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        // Draw the question mark
        drawQuestionMark();

        // Draw debug mode indicator and "Reset All" button if debug mode is active
        if (debugMode) {
            // Draw debug mode indicator
            drawTextWithOutline('Debug Mode', 10, 30, '#4CAF50', 'black', 2, '20px', 'bold', 'left', 'top');

            // Draw "Reset All" button in top right
            const resetButtonWidth = 100;
            const resetButtonHeight = 40;
            const resetButtonX = gameWidth - resetButtonWidth - 10;
            const resetButtonY = 10;
            drawButton(resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight, 'Reset All', '#FF4136', 'white', '16px');
        }

        return;  // Don't draw anything else
    }

    // Draw pipes
    pipes.forEach(pipe => {
        // ... (rest of the pipe drawing code) ...
    });

// Draw bird
ctx.save();
ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
ctx.rotate(bird.rotation);

// Determine which image to use based on velocity
let imageToDraw;
if (bird.velocity < -1) {
    imageToDraw = crumpImgUp;
} else if (bird.velocity > 1) {
    imageToDraw = crumpImgDown;
} else {
    imageToDraw = currentCrumpImg;
}

if (currentCharacterIndex === 'crump0') {
    // Adjust these values for crump0
    const scaleX = 3.75;  // Increase scale if crump0 is too small
    const scaleY = 3.75;
    const offsetX = -bird.width * 0.125;  // Adjust to center horizontally
    const offsetY = -bird.height * 0.125; // Adjust to center vertically
    
    ctx.drawImage(
        imageToDraw,
        0, 0, 200, 200,  // Source rectangle (full image)
        -bird.width / 2 + offsetX, -bird.height / 2 + offsetY, 
        bird.width * scaleX, bird.height * scaleY  // Scaled size for crump0
    );
} else {
    // Original drawing for other characters
    ctx.drawImage(
        imageToDraw,
        0, 0, 200, 200,  // Source rectangle (full image)
        -bird.width / 2, -bird.height / 2, bird.width, bird.height  // Destination rectangle (scaled)
    );
}

ctx.restore();

// Draw score
drawTextWithOutline(`Score: ${score}`, 10, 24, '#FFD700', 'black', 2, '24px', 'bold', 'left', 'top');

// Draw high score
const currentHighScore = hardModeActive ? hardModeHighScore : normalModeHighScore;
drawTextWithOutline(`High Score: ${currentHighScore}`, 10, 48, '#FFFFFF', 'black', 2, '20px', 'normal', 'left', 'top');

// Draw debug information on top of everything else
drawDebugInfo();

// Always draw the question mark on top
drawQuestionMark();

if (showingInstructions) {
    drawInstructionsPopup();
}

// Debug log
console.log(`Drawing question mark at: ${gameWidth - 60} 10`);
}

// Add this function to draw buttons
function drawButton(x, y, width, height, text, fillColor, textColor, fontSize = '24px') {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize} ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
}

// Add this function to toggle debug mode
function toggleDebugMode() {
    debugMode = !debugMode;
    console.log(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    
    if (debugMode) {
        canvas.style.cursor = 'default';
    } else {
        canvas.style.cursor = 'none';
    }
    
    // Force a redraw to show/hide debug mode features
    draw();
}

function update() {
    if (!gameStarted) return;
    if (gameOver && !debugMode) {
        hideHardModeUnlockedPopup();
        showCursor();
        return;
    }

    frameCount++;

    // Apply gravity and update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Calculate bird's hitbox
    const birdRadius = bird.width * 0.23; // Adjusted for the 15% increase
    const birdCenterX = bird.x + bird.width / 2;
    const birdCenterY = bird.y + bird.height / 2;

    // Prevent bird from going above the screen using the circular hitbox
    if (birdCenterY - birdRadius < 0) {
        bird.y = birdRadius - bird.height / 2;
        bird.velocity = 0; // Stop upward movement
    }

    // If boosting, reduce the effect of gravity
    if (boosting) {
        bird.velocity *= 0.95; // Reduce velocity decay while boosting
        if (bird.velocity > 0) {
            boosting = false; // Stop boosting when bird starts falling
            boostLevel = 0; // Reset boost level when boost ends
        }
    }

    // Bird animation
    if (flapDownFrames > 0) {
        flapDownFrames--;
        currentCrumpImg = crumpImgDown;
    } else if (flapTransitionFrames > 0) {
        flapTransitionFrames--;
        currentCrumpImg = characterImages[currentCharacterIndex].neutral;
    } else {
        if (bird.velocity >= 0) {
            currentCrumpImg = crumpImgUp;
        } else {
            currentCrumpImg = characterImages[currentCharacterIndex].neutral;
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

    // Debug mode modifications
    if (debugMode) {
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
        if (bird.y + bird.height > gameHeight) {
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

    // Check for hard mode unlock
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
        const logoY = gameHeight * 0.05; // Adjust this value to move the logo up or down

        ctx.drawImage(titleLogoImg, logoX, logoY, logoWidth, logoHeight);

        // Draw character selection
        const characterWidth = gameWidth * 0.2;
        const characterHeight = characterWidth;
        const characterX = (gameWidth - characterWidth) / 2;
        const characterY = gameHeight * 0.45;
        drawCharacterSelection(characterX, characterY, characterWidth, characterHeight);

        // Calculate button dimensions and positions
        const buttonWidth = 140;
        const buttonHeight = buttonWidth * (200 / 480);
        const buttonSpacing = 15;
        const bottomMargin = 30;
        const hardModeButtonY = gameHeight - bottomMargin - buttonHeight;
        const normalModeButtonY = hardModeButtonY - buttonHeight - buttonSpacing;
        const buttonX = (gameWidth - buttonWidth) / 2;

        // Draw "Normal Mode" button
        ctx.drawImage(normalModeImg, buttonX, normalModeButtonY, buttonWidth, buttonHeight);

        if (hardModeUnlocked) {
            // Draw "Hard Mode" button
            ctx.drawImage(hardModeActiveImg, buttonX, hardModeButtonY, buttonWidth, buttonHeight);
        }

        // Draw debug mode indicator and "Reset All" button if debug mode is active
        if (debugMode) {
            // Draw debug mode indicator
            drawTextWithOutline('Debug Mode', 10, 30, '#4CAF50', 'black', 2, '20px', 'bold', 'left', 'top');

            // Draw "Reset All" button in top right
            const resetButtonWidth = 100;
            const resetButtonHeight = 40;
            const resetButtonX = gameWidth - resetButtonWidth - 10;
            const resetButtonY = 10;
            drawButton(resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight, 'Reset All', '#FF4136', 'white', '16px');
        }
         // Draw the question mark
         drawQuestionMark();

         if (showingInstructions) {
            drawInstructionsPopup();
        }
        
        return;  // Don't draw anything else
    }

    // Draw bird with rotation and current image
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);

    // Determine which image to use based on velocity
    let imageToDraw;
    if (bird.velocity < -1) {
        imageToDraw = crumpImgDown;  // Changed from crumpImgUp
    } else if (bird.velocity > 1) {
        imageToDraw = crumpImgUp;    // Changed from crumpImgDown
    } else {
        imageToDraw = currentCrumpImg;
    }

    if (currentCharacterIndex === 'crump0') {
        // Special handling for crump0
        const sizeReductionFactor = 0.7; // Adjust as needed
        const scale = (bird.width / 70) * sizeReductionFactor;
        const scaledWidth = 70 * scale;
        const scaledHeight = 79 * scale;
        const offsetX = (bird.width - scaledWidth) / 2;
        const offsetY = (bird.height - scaledHeight) / 2;

        ctx.drawImage(
            imageToDraw,
            -bird.width / 2 + offsetX, -bird.height / 2 + offsetY, 
            scaledWidth, scaledHeight
        );
    } else {
        // Original drawing for other characters
        ctx.drawImage(
            imageToDraw,
            -bird.width / 2, -bird.height / 2, bird.width, bird.height
        );
    }

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

    drawUnlockNotification();

    // Draw score - align left
    drawTextWithOutline(`Score: ${score}`, 10, 24, '#FFD700', 'black', 2, '24px', 'bold', 'left', 'top');

    // Draw high score - align left
    const currentHighScore = hardModeActive ? hardModeHighScore : normalModeHighScore;
    drawTextWithOutline(`High Score: ${currentHighScore}`, 10, 48, '#FFFFFF', 'black', 2, '20px', 'normal', 'left', 'top');

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

    // Calculate dimensions for the mode images
    const modeImgWidth = gameWidth * 0.25;
    const modeImgHeight = modeImgWidth * (200 / 480);
    const modeImgX = gameWidth - modeImgWidth - 5;
    const modeImgY = gameHeight - modeImgHeight - 5;

    // Draw mode indicator
    if (showingUnlockPopup && !gameOver) {
        ctx.drawImage(hardModeUnlockedImg, modeImgX, modeImgY, modeImgWidth, modeImgHeight);
    } else if (hardModeActive) {
        if (gameOver) {
            ctx.globalAlpha = 0.5;
        }
        ctx.drawImage(hardModeActiveImg, modeImgX, modeImgY, modeImgWidth, modeImgHeight);
        ctx.globalAlpha = 1.0;
    } else {
        ctx.drawImage(normalModeImg, modeImgX, modeImgY, modeImgWidth, modeImgHeight);

        // Draw progress indicator for hard mode unlock
        if (!hardModeUnlocked) {
            const progress = Math.min(score / HARD_MODE_UNLOCK_SCORE, 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; // Transparent white
            
            // Calculate the actual dimensions of the "Normal Mode" text within the image
            const textWidth = modeImgWidth * 0.9; // Adjust this value as needed
            const textHeight = modeImgHeight * 0.7; // Adjust this value as needed
            const textX = modeImgX + (modeImgWidth - textWidth) / 2;
            const textY = modeImgY + (modeImgHeight - textHeight) / 2;

            ctx.fillRect(textX, textY, textWidth * progress, textHeight);
        }
    }

    if (gameOver) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Move "Game Over" text up
        drawTextWithOutline('Game Over', gameWidth / 2, gameHeight * 0.2, '#FF4136', 'black', 3, '48px', 'bold', 'center', 'middle');

        // Move Score and High Score up
        drawTextWithOutline(`Score: ${score}`, gameWidth / 2, gameHeight * 0.3, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');
        drawTextWithOutline(`High Score: ${currentHighScore}`, gameWidth / 2, gameHeight * 0.35, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');
        drawQuestionMark();

        if (Date.now() - gameOverTime < GAME_OVER_DELAY) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, gameHeight - 5, (Date.now() - gameOverTime) / GAME_OVER_DELAY * gameWidth, 5);
        } else {
            // Draw character selection
            const characterWidth = gameWidth * 0.2;
            const characterHeight = characterWidth;
            const characterX = (gameWidth - characterWidth) / 2;
            const characterY = gameHeight * 0.45;
            drawCharacterSelection(characterX, characterY, characterWidth, characterHeight);
            
            // Calculate button dimensions and positions
            const buttonWidth = 140;
            const buttonHeight = buttonWidth * (200 / 480);
            const buttonSpacing = 15;
            const bottomMargin = 30;
            const hardModeButtonY = gameHeight - bottomMargin - buttonHeight;
            const normalModeButtonY = hardModeButtonY - buttonHeight - buttonSpacing;
            const buttonX = (gameWidth - buttonWidth) / 2;

            // Draw "Normal Mode" button
            ctx.drawImage(normalModeImg, buttonX, normalModeButtonY, buttonWidth, buttonHeight);

            if (hardModeUnlocked) {
                // Draw "Hard Mode" button
                ctx.drawImage(hardModeActiveImg, buttonX, hardModeButtonY, buttonWidth, buttonHeight);
            }
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    // Always check if instructions should be shown last
    if (showingInstructions) {
        drawInstructionsPopup();
    }
    // Draw debug information on top of everything else
    drawDebugInfo();
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

// Add these new functions near the top of your file
function hideCursor() {
    canvas.style.cursor = 'none';
}

function showCursor() {
    canvas.style.cursor = 'auto';
}

// Add these event listeners at the end of your file
canvas.addEventListener('mousemove', function() {
    if (gameStarted && !gameOver) {
        hideCursor();
    }
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden && gameStarted && !gameOver) {
        hideCursor();
    } else {
        showCursor();
    }
});

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
    currentCrumpImg.decode(),
    crumpImgUp.decode(),
    crumpImgDown.decode(),
    backgroundImg.decode(),
    titleLogoImg.decode(),
    hardModeUnlockedImg.decode(),
    hardModeActiveImg.decode(),
    normalModeImg.decode()
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
        normalModeHighScore = 0;
        hardModeHighScore = 0;
        localStorage.setItem('normalModeHighScore', '0');
        localStorage.setItem('hardModeHighScore', '0');
        console.log('Normal and Hard Mode High Scores reset to 0');
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
        toggleDebugMode();
    }
};

function drawDebugInfo() {
    if (!debugMode) return;

    // Save the current canvas state
    ctx.save();

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Draw hit boxes
    ctx.lineWidth = 2;

    // Bird hit box
    const birdRadius = bird.width * 0.23;
    const birdCenterX = bird.x + bird.width / 2;
    const birdCenterY = bird.y + bird.height / 2;
    
    // Change bird hit box color based on boosting state
    ctx.strokeStyle = boosting ? 'green' : 'red';
    
    ctx.beginPath();
    ctx.arc(birdCenterX, birdCenterY, birdRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Pipe hit boxes
    ctx.strokeStyle = 'blue';
    for (let pipe of pipes) {
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, gameHeight - pipe.bottomY);
    }

    // Draw "Reset All" button in top right
    const resetButtonWidth = 100;
    const resetButtonHeight = 40;
    const resetButtonX = gameWidth - resetButtonWidth - 10;
    const resetButtonY = 10;
    drawButton(resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight, 'Reset All', '#FF4136', 'white', '16px');

    // Draw debug mode indicator
    drawTextWithOutline('Debug Mode', 10, 30, '#4CAF50', 'black', 2, '20px', 'bold', 'left', 'top');

    // Diagnostic information
    let yPos = 60;
    [
        `Score: ${score}`,
        `High Score: ${hardModeActive ? hardModeHighScore : normalModeHighScore}`,
        `Background X: ${backgroundX.toFixed(2)}`,
        `Bird Y: ${bird.y.toFixed(2)}`,
        `Bird Velocity: ${bird.velocity.toFixed(2)}`,
        `Pipes: ${pipes.length}`,
        `Pipes Passed: ${pipesPassed}`,
        `Pipe Speed: ${pipeSpeed.toFixed(2)}`,
        `Frame Count: ${frameCount}`,
        `Boosting: ${boosting}`,
        `Boost Level: ${boostLevel}`,  // Add this line
        pipes.length > 0 ? `First Pipe X: ${pipes[0].x.toFixed(2)}` : ''
    ].forEach(text => {
        drawTextWithOutline(text, 10, yPos, 'white', 'black', 2, '16px');
        yPos += 25;
    });

    // Restore the canvas state
    ctx.restore();
}