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
    crump3: 'GOOGINI',
    crump4: "BEAR",
    crump5: "MORTY",
    crump6: "XK",
    crump7: "JELLY"
    // Add more character names as needed
};
// Add this new array to store character images
const characterImages = [];

const characterEffects = {
    crump1: { speedSparkle: true },
    crump2: { speedSparkle: true },
    crump3: { speedSparkle: true },
    crump4: { speedSparkle: true },
    crump5: { speedSparkle: true },
    crump6: { speedSparkle: true },
    crump7: { sparkle: true, speedSparkle: true },
    crump8: { speedSparkle: true },
    crump9: { speedSparkle: true },
    crump0: { speedSparkle: true }
    // Add this for any other characters you have
};

// Define unlock conditions
const unlockConditions = {
    crump0: { mode: 'Hard', score: 20 },
    crump2: { mode: 'Normal', score: 20 },
    crump3: { mode: 'Normal', score: 30 },
    crump4: { mode: 'Normal', score: 40 },
    crump5: { mode: 'Normal', score: 50 },
    crump6: { mode: 'Hard', score: 10 },
    crump7: { mode: 'Hard', score: 30 }
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
    return ['crump0', 'crump1', 'crump2', 'crump3', 'crump4', 'crump5', 'crump6', 'crump7'
    ]; 
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

function getCharacterDifficulty(character) {
    if (character === ALWAYS_UNLOCKED_CHARACTER) return -1; // Always first
    const condition = unlockConditions[character];
    if (!condition) return Infinity; // Put unknown characters at the end
    return (condition.mode === 'Hard' ? 1000 : 0) + condition.score;
}

const sortedCharacters = getCharacterFolders().sort((a, b) => {
    return getCharacterDifficulty(a) - getCharacterDifficulty(b);
});

function switchCharacter(direction) {
    let availableCharacters = sortedCharacters.filter(char => unlockedCharacters[char]);
    let currentIndex = availableCharacters.indexOf(currentCharacterIndex);
    currentIndex = (currentIndex + direction + availableCharacters.length) % availableCharacters.length;
    currentCharacterIndex = availableCharacters[currentIndex];
    updateCharacterImages();
}

function initializeCharacters() {
    sortedCharacters.forEach((folder) => {
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
}

let showingUnlockNotification = false;
let unlockNotificationText = '';
let unlockNotificationTimer = null;

function showUnlockNotification(characterName) {
    showingUnlockNotification = true;
    unlockNotificationText = `${characterName} UNLOCKED!`;
    
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


function update(deltaTime) {
    // ... other update code ...
    sparkleTime += deltaTime;
}

// Character effect drawing function

function updateSpeedSparkles() {
    if (score >= 15 && characterEffects[gameplayCharacter]?.speedSparkle) {
        // Define an offset to place sparkles behind the character
        const sparkleOffsetX = -10; // Adjust this value as needed

        // Add new sparkles
        const centerX = bird.x + bird.width / 2 + sparkleOffsetX; // Add offset here
        const centerY = bird.y + bird.height / 2;
        
        speedSparklePositions.unshift({
            x: centerX + (Math.random() - 0.5) * 10,
            y: centerY + (Math.random() - 0.5) * 10,
            age: 0,
            rotation: Math.random() * Math.PI * 2
        });

        // Update existing sparkles
        speedSparklePositions.forEach(sparkle => {
            sparkle.age++;
            sparkle.x -= pipeSpeed; // Move sparkles left at pipe speed
        });

        // Remove old sparkles
        speedSparklePositions = speedSparklePositions.filter(sparkle => sparkle.age < MAX_SPEED_SPARKLE_COUNT);
    } else {
        speedSparklePositions = []; // Clear sparkles if conditions are not met
    }
}

function drawSpeedSparkles() {
    if (score >= 15 && characterEffects[gameplayCharacter]?.speedSparkle) {
        const speedFactor = pipeSpeed / INITIAL_PIPE_SPEED;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Common fill style
        ctx.save(); // Save once before the loop

        speedSparklePositions.forEach((sparkle) => {
            const ageRatio = sparkle.age / MAX_SPEED_SPARKLE_COUNT;
            const size = Math.max(1, 3 - (3 - 1) * ageRatio * speedFactor);
            const opacity = Math.max(0, 1 - ageRatio * 1.2); // Starts at 1 (full opacity) and fades out

            if (size > 0) {
                ctx.globalAlpha = opacity;
                ctx.fillRect(sparkle.x - size / 2, sparkle.y - size / 2, size, size);
            }
        });

        ctx.restore(); // Restore once after the loop
    }
}

function drawSparkles() {
    if (characterEffects[gameplayCharacter]?.sparkle) {
        // Calculate speed factor based on pipe speed
        const baseSpeed = INITIAL_PIPE_SPEED;
        const speedFactor = pipeSpeed / baseSpeed;
        
        // Define an offset to place sparkles behind the character
        const sparkleOffsetX = -10; // Adjust this value as needed
        
        sparklePositions.forEach((sparkle) => {
            const ageRatio = sparkle.age / MAX_SPARKLE_COUNT;
            
            // Size calculation: start big, shrink faster, but never below minSize
            const maxSize = 3.5;
            const minSize = 1; // Increased minimum size to ensure visibility
            const size = Math.max(minSize, maxSize - (maxSize - minSize) * ageRatio * speedFactor);
            
            // Color transition from purple to white (faster)
            const colorTransitionSpeed = 3; // Increase this value for faster color transition
            const colorRatio = Math.min(1, ageRatio * colorTransitionSpeed);
            const r = Math.round(180 + (75 * colorRatio));
            const g = Math.round(100 + (155 * colorRatio));
            const b = Math.round(220 + (35 * colorRatio));
            
            // Opacity calculation (slower fade out)
            const opacityFadeStart = 0.3; // Start fading at 30% of lifespan
            let opacity;
            if (ageRatio < opacityFadeStart) {
                opacity = 0.5; // Full opacity until fade starts
            } else {
                opacity = 0.5 * (1 - (ageRatio - opacityFadeStart) / (1 - opacityFadeStart));
            }

            // Apply the X offset to the sparkle position
            const adjustedX = sparkle.x + sparkleOffsetX;

            // Only draw if size is positive
            if (size > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                
                // Move to the center of where we want to draw the sparkle
                ctx.translate(Math.floor(adjustedX), Math.floor(sparkle.y));
                
                // Rotate the context
                ctx.rotate(sparkle.rotation || (sparkle.rotation = Math.random() * Math.PI * 2));
                
                // Draw the rotated square
                ctx.fillRect(
                    Math.floor(-size / 2), 
                    Math.floor(-size / 2), 
                    Math.ceil(size), 
                    Math.ceil(size)
                );
                
                ctx.restore();
            }
        });
    }
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
    checkFirstTimeUser();
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
let isFirstPipe = true;
let currentPipeImageIndex = 0;
let pipeCounter = 0;
let score = 0;
let normalModeHighScore = parseInt(localStorage.getItem('normalModeHighScore')) || 0;
let hardModeHighScore = parseInt(localStorage.getItem('hardModeHighScore')) || 0;
let gameOver = false;
let gameStarted = false;
let debugMode = false;
let debugModeActivated = false;
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
const BASE_BOOST_MULTIPLIER = 1.15;
const BOOST_INCREMENT = 0.2;
const BOOST_THRESHOLD = 250; // Adjust this value as needed (in milliseconds)
const trailPositions = [];
const MAX_TRAIL_LENGTH = 7;

// Flap animation variables
let lastFlapDirection = 0; // 0 for neutral, -1 for up, 1 for down
let flapDownFrames = 0;
let flapTransitionFrames = 0;
const FLAP_DOWN_DURATION = 3; 
const FLAP_TRANSITION_DURATION = 2; // Duration for transition to neutral
let sparkleTime = 0;
const sparklePositions = [];
const MAX_SPARKLE_COUNT = 50;
const MAX_SPEED_SPARKLE_COUNT = 35;
let speedSparkles = [];
let speedSparklePositions = [];

let scoreSubmitted = false;
let showingLeaderboard = false;
let currentLeaderboardData = null;
let currentLeaderboardMode = '';
let currentLeaderboardType = 'overall'; // 'overall' or 'weekly'
let isModalOpen = false;



// Load pipe images
const pipeImgs = [
    'pipe1.png',
    'pipe2.png',
    //'pipe3.png',
    'pipe4.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});


async function showLeaderboard() {
    console.log('Showing leaderboard');
    showingLeaderboard = true;
    const mode = hardModeActive ? 'Hard' : 'Normal';
    currentLeaderboardMode = mode;
    console.log(`Fetching ${currentLeaderboardType} leaderboard for ${mode} mode`);
    try {
        const leaderboardData = await fetchLeaderboard(mode);
        console.log('Leaderboard data:', leaderboardData);
        currentLeaderboardData = leaderboardData;
        displayLeaderboard(currentLeaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        displayLeaderboard([]); // This will trigger the "No leaderboard data available" message
    }
}

function sanitizeInput(input) {
    // Remove any HTML tags and trim whitespace
    return input.replace(/(<([^>]+)>)/gi, "").trim();
}

async function submitScore(score, mode) {
    if (score <= 1) {
        //    if (score <= 1 || debugModeActivated) {
        console.log("Score not submitted: Too low or debug mode was used");
        return;
    }

    try {
        const response = await fetch(`https://crumpjump.onrender.com/api/leaderboard/${mode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const leaderboard = await response.json();

        let playerName = localStorage.getItem('username') || "";

        // Check if score is eligible for leaderboard
        if (leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score) {
            // Prompt for name, pre-populated with current username
            const newName = await showNameInputModal(playerName, 'New High Score!', 'Enter your name for the leaderboard:');
            if (newName) {
                playerName = newName; // Use the new name if provided
            } else if (!playerName) {
                console.log("Name input cancelled, score not submitted");
                return; // Exit if user cancels name input and no existing name is set
            }
        } else if (!playerName) {
            // If not a high score but no username is set, use a default
            playerName = "noHighScore";
        }

        // Proceed to submit the score with the playerName
        const submitResponse = await fetch('https://crumpjump.onrender.com/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                playerName, 
                score, 
                mode,
                character: gameplayCharacter
            })
        });

        if (!submitResponse.ok) {
            throw new Error(`HTTP error! status: ${submitResponse.status}`);
        }
        const data = await submitResponse.json();
        console.log(data.message);

        if (leaderboard.length >= 10 && score <= leaderboard[leaderboard.length - 1].score) {
            console.log("Score submitted but not high enough for leaderboard.");
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        alert("Failed to submit score. Please refresh the page and try again.");
    } finally {
        scoreSubmitted = true;
    }
}



function showNameInputModal(currentName = '', title = '', message = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('nameModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');
        const input = document.getElementById('playerNameInput');
        const submitButton = document.getElementById('submitName');

        // Set the title and message
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        input.value = currentName; // Pre-populate with current name
        modal.style.display = 'block';
        input.focus();
        isModalOpen = true; // Set to true when modal is open
        showCursor();  // Show cursor when modal is open

        submitButton.onclick = () => {
            let playerName = sanitizeInput(input.value);
            if (playerName.length > 0) {
                closeModal();
                resolve(playerName);
            } else {
                alert("Please enter a valid name.");
            }
        };

        // Allow closing the modal without submitting
        modal.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
                resolve(null);
            }
        };

        // Prevent closing when clicking inside the modal content
        modalContent.onclick = (event) => {
            event.stopPropagation();
        };

        // Disable keyboard events that might interfere
        document.addEventListener('keydown', preventDefaultForModal);
    });
}

function preventDefaultForModal(event) {
    if (isModalOpen) {
        // Stop propagation for all key events when modal is open
        event.stopPropagation();

        // Allow letters, numbers, backspace, enter, and space
        if (!/^[a-zA-Z0-9]$/.test(event.key) && 
            event.key !== 'Backspace' && 
            event.key !== 'Enter' &&
            event.key !== ' ') {
            event.preventDefault();
        }
        
        // Prevent space from scrolling the page
        if (event.key === ' ' && event.target !== document.getElementById('playerNameInput')) {
            event.preventDefault();
        }

        // Prevent default behavior for all keys except those explicitly allowed
        if (!/^[a-zA-Z0-9]$/.test(event.key) && 
            event.key !== 'Backspace' && 
            event.key !== 'Enter' &&
            event.key !== ' ') {
            event.preventDefault();
        }
    }
}

function closeModal() {
    const modal = document.getElementById('nameModal');
    modal.style.display = 'none';
    isModalOpen = false; // Set to false when modal is closed
    document.removeEventListener('keydown', preventDefaultForModal);
    showCursor();  // Ensure cursor is visible after closing modal
}

function checkFirstTimeUser() {
    if (!localStorage.getItem('username')) {
        showNameInputModal('', 'Choose Username', '')
            .then(username => {
                if (username) {
                    localStorage.setItem('username', username);
                }
            });
    }
}

// Call this when your game starts
initGame();

async function fetchLeaderboard(mode) {
    try {
        const response = await fetch(`https://crumpjump.onrender.com/api/leaderboard/${mode}/${currentLeaderboardType}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

function displayLeaderboard(leaderboardData) {
    if (!leaderboardData || leaderboardData.length === 0) {
        // Switch back to the OVERALL leaderboard type
        if (currentLeaderboardType !== 'overall') {
            currentLeaderboardType = 'overall';
            
            // Show an error message
            drawTextWithOutline('No leaderboard data available', gameWidth / 2, gameHeight / 2 - 20, 'white', 'black', 2, '24px', 'normal', 'center', 'middle');
            drawTextWithOutline('Switching back to OVERALL', gameWidth / 2, gameHeight / 2 + 20, 'white', 'black', 2, '18px', 'normal', 'center', 'middle');
            
            // Fetch the OVERALL leaderboard data after a short delay
            setTimeout(() => {
                showLeaderboard();
            }, 2000);
        } else {
            // If we're already on OVERALL, just show the error message
            drawTextWithOutline('No leaderboard data available', gameWidth / 2, gameHeight / 2, 'white', 'black', 2, '24px', 'normal', 'center', 'middle');
        }
        return;
    }

    // Sort the leaderboard data
    leaderboardData.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score; // Higher score first
        }
        // If scores are tied, sort by oldest timestamp first
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    const titleText = `${currentLeaderboardMode.toUpperCase()} MODE`;
    drawTextWithOutline(titleText, gameWidth / 2, 15, '#FFD700', 'black', 3, '32px', 'bold', 'center', 'middle');

    let yPos = 70;
    const imgSize = 35;
    const haloSize = imgSize - 6;
    const haloColor = 'rgba(255, 255, 255, 0.2)';

    leaderboardData.slice(0, 10).forEach((entry, index) => {
        const date = new Date(entry.timestamp);
        const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;

        const scoreText = `${entry.playerName}: ${entry.score}`;
        drawTextWithOutline(scoreText, gameWidth / 2, yPos, 'white', 'black', 2, '22px', 'normal', 'center', 'middle');

        drawTextWithOutline(formattedDate, gameWidth / 2, yPos + 20, '#CCCCCC', 'black', 1, '14px', 'normal', 'center', 'middle');

        const characterKey = entry.character || 'crump1';
        if (characterImages[characterKey]) {
            const img = characterImages[characterKey].up;
            const imgX = gameWidth / 2 - 140;
            const imgY = yPos - imgSize / 2;

            ctx.beginPath();
            ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, haloSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = haloColor;
            ctx.fill();

            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        }

        yPos += 42;
    });

    // Draw arrows for toggling between overall and weekly
    drawLeaderboardArrows();
}

function drawLeaderboardArrows() {
    const arrowWidth = 8;
    const arrowHeight = 8;
    const leftArrowX = 110;
    const rightArrowX = gameWidth - arrowWidth - 110;
    const arrowY = 40;

    const lightBlueColor = '#4169E1'; // Deep Sky Blue

    // Draw left arrow
    ctx.fillStyle = lightBlueColor;
    ctx.beginPath();
    ctx.moveTo(leftArrowX + arrowWidth, arrowY);
    ctx.lineTo(leftArrowX, arrowY + arrowHeight / 2);
    ctx.lineTo(leftArrowX + arrowWidth, arrowY + arrowHeight);
    ctx.closePath();
    ctx.fill();

    // Draw right arrow
    ctx.beginPath();
    ctx.moveTo(rightArrowX, arrowY);
    ctx.lineTo(rightArrowX + arrowWidth, arrowY + arrowHeight / 2);
    ctx.lineTo(rightArrowX, arrowY + arrowHeight);
    ctx.closePath();
    ctx.fill();

    // Draw leaderboard type in ALL CAPS
    const typeText = currentLeaderboardType.toUpperCase();
    drawTextWithOutline(typeText, gameWidth / 2, arrowY + arrowHeight / 2, lightBlueColor, 'black', 2, '24px', 'bold', 'center', 'middle');
}

function handleLeaderboardClick(x, y) {
    const arrowWidth = 8;
    const arrowHeight = 8;
    const leftArrowX = 110;
    const rightArrowX = gameWidth - arrowWidth - 110;
    const arrowY = 40;

    // Increase the tap area for better usability
    const tapAreaSize = 30;
    const leftTapX = leftArrowX - (tapAreaSize - arrowWidth) / 2;
    const rightTapX = rightArrowX - (tapAreaSize - arrowWidth) / 2;
    const tapY = arrowY - (tapAreaSize - arrowHeight) / 2;

    if (isTapWithinButton(x, y, leftTapX, tapY, tapAreaSize, tapAreaSize) ||
        isTapWithinButton(x, y, rightTapX, tapY, tapAreaSize, tapAreaSize)) {
        // Toggle leaderboard type
        currentLeaderboardType = currentLeaderboardType === 'overall' ? 'weekly' : 'overall';
        showLeaderboard();
    } else {
        // If clicked outside the arrows, close the leaderboard
        showingLeaderboard = false;
        currentLeaderboardData = null;
        currentLeaderboardMode = '';
        draw(); // Redraw the game screen
        showCursor();
    }
}

function drawCharacterSelection(x, y, width, height, characterToShow = null) {
    const characterToDisplay = characterToShow || currentCharacterIndex;

    // Draw character
    if (characterImages[characterToDisplay]) {
        const img = characterImages[characterToDisplay].up;
        if (img.complete) {
            // Calculate scaling to fit the image within the given dimensions
            let scale = Math.min(width / img.width, height / img.height);
            
            // Apply a smaller scale factor for crump0
            if (characterToDisplay === 'crump0') {
                scale *= 0.75; // Adjust this value to make crump0 smaller or larger
            }
            
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

    // Only draw UI elements if not showing a specific character (i.e., for selection screen)
    if (!characterToShow) {
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
        ctx.font = `20px ${GAME_FONT}`;
        ctx.textAlign = 'center';
        const name = characterNames[currentCharacterIndex] || currentCharacterIndex;
        ctx.fillText(name, x + width / 2, y + height + 10);
        
        // Draw unlock condition
        if (!unlockedCharacters[currentCharacterIndex]) {
            ctx.fillStyle = 'yellow';
            ctx.font = `14px ${GAME_FONT}`;
            ctx.fillText(getUnlockCondition(currentCharacterIndex), x + width / 2, y + height + 25);
        }
    }
}

function drawCurrentUsername() {
    const username = localStorage.getItem('username') || 'No Username';
    const text = `${username}`;
    const yPosition = gameHeight - 15;
    const xPosition = gameWidth / 2;
    const fontSize = 20; // Set the desired font size here

    // Calculate text width using the correct font size
    ctx.font = `${fontSize}px ${GAME_FONT}`;
    const textWidth = ctx.measureText(text).width;

    // Draw edit symbol (pencil icon)
    const editSymbolSize = 16;
    const editSymbolX = xPosition - textWidth / 2 - editSymbolSize; // Move it closer to the text
    const editSymbolY = yPosition;
    
    ctx.fillStyle = 'white';
    ctx.font = `${editSymbolSize}px ${GAME_FONT}`;
    ctx.fillText('✎', editSymbolX, editSymbolY);

    // Draw username
    drawTextWithOutline(text, xPosition, yPosition, 'white', 'black', 2, `20px`, 'normal', 'center', 'middle');
}

function updateTrailPositions() {
    // Calculate the center of the bird
    const centerX = bird.x + bird.width / 2;
    const centerY = bird.y + bird.height / 2;
    
    // Add a slight offset to position the trail behind the bird
    const trailOffsetX = 0; // Adjust this value as needed
    const trailOffsetY = 0;  // Adjust this value as needed
    
    trailPositions.unshift({ 
        x: centerX + trailOffsetX, 
        y: centerY + trailOffsetY 
    });
    
    if (trailPositions.length > MAX_TRAIL_LENGTH) {
        trailPositions.pop();
    }
}

function drawBoostTrail() {
    if (trailPositions.length > 1) {
        // Draw the normal boost trail only when boosting
        if (boosting) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(trailPositions[0].x, trailPositions[0].y);
            for (let i = 1; i < trailPositions.length; i++) {
                ctx.lineTo(trailPositions[i].x, trailPositions[i].y);
                ctx.globalAlpha = 1 - (i / trailPositions.length); // Fade out the trail
            }
            ctx.stroke();
            ctx.globalAlpha = 1; // Reset global alpha
        }

        // Add sparkles for crump7 always
        if (currentCharacterIndex === 'crump7') {
            for (let i = 0; i < trailPositions.length; i++) {
                const sparkleCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 sparkles per position
                for (let j = 0; j < sparkleCount; j++) {
                    const offsetX = (Math.random() - 0.5) * 20 - 20; // Shift sparkles to the left
                    const offsetY = (Math.random() - 0.5) * 20;
                    const size = (Math.sin(sparkleTime * 10 + i * 0.5) * 2 + 3) * (1 - i / trailPositions.length);
                    const rotation = sparkleTime * 2 + i * 0.1;
                    drawSparkles(
                        trailPositions[i].x + offsetX,
                        trailPositions[i].y + offsetY,
                        size,
                        rotation
                    );
                }
            }
        }
    }
}

function switchCharacter(direction) {
    const sortedCharacters = getCharacterFolders().sort((a, b) => {
        return getCharacterDifficulty(a) - getCharacterDifficulty(b);
    });
    let currentIndex = sortedCharacters.indexOf(currentCharacterIndex);
    currentIndex = (currentIndex + direction + sortedCharacters.length) % sortedCharacters.length;
    currentCharacterIndex = sortedCharacters[currentIndex];
    updateCharacterImages();
}

// Add this function to check if a tap is within a button area
function isTapWithinButton(x, y, buttonX, buttonY, buttonWidth, buttonHeight) {
    return x >= buttonX && x <= buttonX + buttonWidth &&
           y >= buttonY && y <= buttonY + buttonHeight;
}


// Add this function to handle both mouse clicks and touch events
function handlePointerEvent(event) {
    if (isModalOpen) return;  // Ignore input if modal is open
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
   
    // Check if leaderboard is showing and handle it first
    if (showingLeaderboard) {
        handleLeaderboardClick(tapX, tapY);
        return;
    }

    // Check if instructions are showing
    if (showingInstructions) {
        showingInstructions = false;
        //console.log('Instructions hidden');
        draw(); // Force an immediate redraw
        return; // Exit the function to prevent other clicks
    }
    
    // Check if the question mark was clicked (do this check first)
    if (isQuestionMarkClicked(tapX, tapY)) {
        showingInstructions = !showingInstructions;
        //console.log(`Toggled instructions: ${showingInstructions}`); // Debug log
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
        const characterY = gameHeight * 0.475;

        // In the character selection click handling part:
        if (isTapWithinButton(tapX, tapY, characterX - 40, characterY + characterHeight / 2 - 15, 30, 30)) {
            switchCharacter(-1);
            return;
        }

        if (isTapWithinButton(tapX, tapY, characterX + characterWidth + 10, characterY + characterHeight / 2 - 15, 30, 30)) {
            switchCharacter(1);
            return;
        }

        // Check if "Leaderboard" button was clicked
        const leaderboardButtonWidth = 120; // Match the new width
        const leaderboardButtonHeight = 25;
        const leaderboardButtonX = (gameWidth - leaderboardButtonWidth) / 2;
        const leaderboardButtonY = gameHeight * 0.4; // Match the new position
        if (isTapWithinButton(tapX, tapY, leaderboardButtonX, leaderboardButtonY, leaderboardButtonWidth, leaderboardButtonHeight)) {
            showLeaderboard();
            return;
        }

        // Check if the edit username button was clicked
        const username = localStorage.getItem('username') || 'No Username';
        const fontSize = 20; // Match the font size in drawCurrentUsername
        const yPosition = gameHeight - 15;
        const xPosition = gameWidth / 2;

        ctx.font = `${fontSize}px ${GAME_FONT}`;
        const textWidth = ctx.measureText(username).width;

        const editSymbolSize = 16;
        const editSymbolX = xPosition - textWidth / 2 - editSymbolSize;
        const editSymbolY = yPosition;

        // Increase the tap area for better usability
        const tapAreaSize = editSymbolSize * 2;
        if (isTapWithinButton(tapX, tapY, editSymbolX - tapAreaSize/2, editSymbolY - tapAreaSize/2, tapAreaSize, tapAreaSize)) {
            showNameInputModal(username, 'Choose Username', '')
                .then(newUsername => {
                    if (newUsername) {
                        localStorage.setItem('username', newUsername);
                        draw(); // Redraw to show updated username
                    }
                });
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
    gameplayCharacter = currentCharacterIndex; // Set the gameplay character
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
    if (isModalOpen) return;  // Ignore input if modal is open

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
    isFirstPipe = true;
    currentPipeImageIndex = 0;
    pipeCounter = 0;
    score = 0;
    pipesPassed = 0;
    gameOver = false;
    frameCount = 0;
    backgroundSpeed = INITIAL_BACKGROUND_SPEED;
    pipeSpeed = INITIAL_PIPE_SPEED;
    testMode = false;
    debugModeActivated = false;
    lastFlapDirection = 0;
    flapDownFrames = 0;
    flapTransitionFrames = 0;
    currentCrumpImg = characterImages[currentCharacterIndex].neutral;
    crumpImgUp = characterImages[currentCharacterIndex].up;
    crumpImgDown = characterImages[currentCharacterIndex].down;
    lastPipeSpawnX = gameWidth;
    // Note: We're not resetting gameStarted to false here
    gameOver = false;
    gameOverHandled = false;
    scoreSubmitted = false;
    console.log("Game reset, all flags set to false");
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

const MIN_VERTICAL_DISTANCE = 20; // Minimum vertical distance between consecutive gaps
const MAX_VERTICAL_DISTANCE = 165; // Maximum vertical distance between consecutive gaps

let lastPipeGapCenter = gameHeight / 2; // Initialize to middle of screen

function createPipe() {
    const gapHeight = hardModeActive ? 120 : 150;
    const minGapTop = 50;
    const maxGapBottom = gameHeight - 50;
    
    let newGapCenter;

    if (isFirstPipe) {
        // Center the gap for the first pipe
        newGapCenter = gameHeight / 2;
        isFirstPipe = false; // Reset the flag
    } else {
        // Existing logic for subsequent pipes
        let minNewGapCenter = Math.max(lastPipeGapCenter - MAX_VERTICAL_DISTANCE, minGapTop + gapHeight / 2);
        let maxNewGapCenter = Math.min(lastPipeGapCenter + MAX_VERTICAL_DISTANCE, maxGapBottom - gapHeight / 2);
        
        // Enforce MIN_VERTICAL_DISTANCE
        const lowerBound = lastPipeGapCenter - MIN_VERTICAL_DISTANCE;
        const upperBound = lastPipeGapCenter + MIN_VERTICAL_DISTANCE;
        
        // Determine the actual range for the new gap center
        const actualMinGapCenter = Math.min(minNewGapCenter, lowerBound);
        const actualMaxGapCenter = Math.max(maxNewGapCenter, upperBound);
        
        if (actualMinGapCenter >= actualMaxGapCenter) {
            // If there's no valid range, alternate above and below the last gap
            const direction = Math.random() < 0.5 ? -1 : 1;
            newGapCenter = lastPipeGapCenter + (direction * MIN_VERTICAL_DISTANCE);
            console.warn("No valid range. Forced adjustment:", direction > 0 ? "up" : "down");
        } else {
            // Generate new gap center, avoiding the exclusion zone
            const lowerRange = lowerBound - actualMinGapCenter;
            const upperRange = actualMaxGapCenter - upperBound;
            const totalRange = lowerRange + upperRange;
            
            if (Math.random() * totalRange < lowerRange) {
                // Choose from lower range
                newGapCenter = actualMinGapCenter + (Math.random() * lowerRange);
            } else {
                // Choose from upper range
                newGapCenter = upperBound + (Math.random() * upperRange);
            }
        }
    }
    
    // Clamp to ensure we're within screen bounds
    newGapCenter = Math.max(minGapTop + gapHeight / 2, Math.min(newGapCenter, maxGapBottom - gapHeight / 2));

    // Update lastPipeGapCenter for next pipe
    lastPipeGapCenter = newGapCenter;
    
    const topHeight = newGapCenter - gapHeight / 2;
    
    // Cycle through pipe images every 5 pipes
    if (pipeCounter % 5 === 0) {
        currentPipeImageIndex = (currentPipeImageIndex + 1) % pipeImgs.length;
    }
    pipeCounter++;
    
    return {
        x: gameWidth,
        y: topHeight + gapHeight,
        width: 50,
        topHeight: topHeight,
        bottomY: topHeight + gapHeight,
        passed: false,
        img: pipeImgs[currentPipeImageIndex]
    };
}

// Modify the checkCollision function to use circular hitbox and return collision point
function checkCollision(birdX, birdY, pipeX, pipeTop, pipeBottom) {
    const birdRadius = bird.width * 0.18; // Reduced from 0.23 to improve perceived collisions
    const birdCenterX = birdX + bird.width / 2;
    const birdCenterY = birdY + bird.height / 2;
    const pipeWidth = 50; // Adjust this to match your pipe width

    // Only check for collision if the bird is horizontally aligned with the pipe
    if (birdCenterX + birdRadius > pipeX && birdCenterX - birdRadius < pipeX + pipeWidth) {
        // Check if bird is too high (colliding with top pipe)
        if (birdCenterY - birdRadius < pipeTop) {
            return { x: birdCenterX, y: pipeTop + birdRadius };
        }
        // Check if bird is too low (colliding with bottom pipe)
        if (birdCenterY + birdRadius > pipeBottom) {
            return { x: birdCenterX, y: pipeBottom - birdRadius };
        }
    }

    // Check collision with ground
    if (birdCenterY + birdRadius > gameHeight) {
        return { x: birdCenterX, y: gameHeight - birdRadius };
    }

    return null; // No collision
}

function updateHighScore() {
    if (hardModeActive) {
        if (score > hardModeHighScore) {
            hardModeHighScore = score;
            localStorage.setItem('hardModeHighScore', hardModeHighScore.toString());
            checkCharacterUnlocks();
            checkAllCharacterUnlocks();
        }
    } else {
        if (score > normalModeHighScore) {
            normalModeHighScore = score;
            localStorage.setItem('normalModeHighScore', normalModeHighScore.toString());
            checkCharacterUnlocks();
            checkAllCharacterUnlocks();
        }
    }
    // Remove score submission from here
}

let gameOverHandled = false;

async function handleGameOver() {
    if (!gameOverHandled) {
        console.log("Game Over function called");
        gameOver = true;
        gameOverTime = Date.now();
        gameplayCharacter = currentCharacterIndex; // Store the character used during gameplay
        gameOverHandled = true;
        updateHighScore();
        showCursor();  // Show the cursor when the game is over
        await submitScore(score, hardModeActive ? 'Hard' : 'Normal');
    }
}


async function promptPlayerName() {
    if (!scoreSubmitted) {
        console.log("Prompting for player name");
        const storedUsername = localStorage.getItem('username') || '';
        const playerName = await showNameInputModal(storedUsername);
        if (playerName) {
            localStorage.setItem('username', playerName); // Update stored username
            await submitScore(score, hardModeActive ? 'Hard' : 'Normal');
            scoreSubmitted = true;
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
        const boxY = gameHeight - boxHeight - 30; // 10px from bottom

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

    // Clear stored username
    localStorage.removeItem('username');

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

    console.log('All variables reset, including unlocked characters and username');
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
const INSTRUCTION_TEXT = "Tap to Jump\nQuick Tap to Boost\n\nHard Mode:\nScore 25 Points to Unlock\n +20% Start Speed\n -20% Gap Size";

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
    
    //console.log(`Question mark clicked: ${clicked}. Tap coordinates: (${tapX}, ${tapY})`);
    
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
        // don't think this matters anymore but don't want to break it
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



if (showingInstructions) {
    drawInstructionsPopup();
}

// Debug log
//console.log(`Drawing question mark at: ${gameWidth - 60} 10`);
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
    debugModeActivated = true;
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
    if (isModalOpen) return;  // Pause game updates if modal is open
    if (!gameStarted) return;
    if (gameOver) {
        if (!gameOverHandled) {
            showCursor();
            handleGameOver();
        }
        return; // Exit the update function immediately if the game is over
    }
    if (gameOver && !debugMode) {
        hideHardModeUnlockedPopup();
        showCursor();
        return;
    } else {
        hideCursor();
    }

    frameCount++;



    // Apply gravity and update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Calculate bird's hitbox
    const birdRadius = bird.width * 0.18; // Reduced from 0.23 to 0.2 
    const birdCenterX = bird.x + bird.width / 2;
    const birdCenterY = bird.y + bird.height / 2;

    // Prevent bird from going above the screen using the circular hitbox
    if (birdCenterY - birdRadius < 0) {
        bird.y = birdRadius - bird.height / 2;
        bird.velocity = 0; // Stop upward movement
    }

    // Update trail positions
    updateTrailPositions();

    // Update speed sparkles
    updateSpeedSparkles();

    // Add this line to update sparkleTime
    sparkleTime += FIXED_DELTA_TIME;

    // Update sparkle positions
    if (characterEffects[currentCharacterIndex]?.sparkle) {
        const centerX = bird.x + bird.width / 2;
        const centerY = bird.y + bird.height / 2;
        
        // Add new sparkle only when the character has moved a certain distance
        if (sparklePositions.length === 0 || 
            Math.abs(centerX - sparklePositions[0].x) > 4 || // Reduced to 4 for more frequent sparkles
            Math.abs(centerY - sparklePositions[0].y) > 4) {
            sparklePositions.unshift({ 
                x: centerX + Math.floor((Math.random() - 0.5) * 8), // Reduced range and floored
                y: centerY + Math.floor((Math.random() - 0.5) * 8), // Reduced range and floored
                initialY: centerY + Math.floor((Math.random() - 0.5) * 16), // Reduced range and floored
                age: 0
            });
        }
        
        // Update existing sparkles
        for (let i = sparklePositions.length - 1; i >= 0; i--) {
            const sparkle = sparklePositions[i];
            sparkle.x -= pipeSpeed; // Move sparkles to the left with pipe speed
            sparkle.y = sparkle.initialY; // Keep Y position constant
            sparkle.age++;
            
            // Remove old sparkles
            if (sparkle.x <= -10 || sparkle.age >= MAX_SPARKLE_COUNT) {
                sparklePositions.splice(i, 1);
            }
        }
        
        // Limit the number of sparkles
        while (sparklePositions.length > MAX_SPARKLE_COUNT) {
            sparklePositions.pop();
        }
    }

    // If boosting, reduce the effect of gravity
    if (boosting) {
        bird.velocity *= 0.95; // Reduce velocity decay while boosting
        if (bird.velocity > 0) {
            boosting = false; // Stop boosting when bird starts falling
            boostLevel = 0; // Reset boost level when boost ends
        }
    }

    // Update flap animation
    if (flapDownFrames > 0) {
        flapDownFrames--;
        imageToDraw = crumpImgDown;
    } else if (flapTransitionFrames > 0) {
        flapTransitionFrames--;
        imageToDraw = currentCrumpImg; // Use neutral image during transition
    } else {
        // Determine which image to use based on velocity
        if (bird.velocity < -1) {
            imageToDraw = crumpImgUp;
            lastFlapDirection = -1;
        } else if (bird.velocity > 1) {
            imageToDraw = crumpImgDown;
            lastFlapDirection = 1;
        } else {
            imageToDraw = currentCrumpImg;
            lastFlapDirection = 0;
        }
    }

    // If we just finished the down frames, start the transition
    if (flapDownFrames === 0 && flapTransitionFrames === 0) {
        flapTransitionFrames = FLAP_TRANSITION_DURATION;
    }

    // Bird rotation
    if (bird.velocity < 0) {
        bird.rotation = -0.3; // Fixed rotation
    } else {
        bird.rotation += 0.05; // Increment rotation
        if (bird.rotation > Math.PI / 6) bird.rotation = Math.PI / 6; // Clamp rotation
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
    if (!isModalOpen) {
        while (currentTime - lastUpdateTime >= FIXED_DELTA_TIME * 1000) {
            update();
            lastUpdateTime += FIXED_DELTA_TIME * 1000;
        }
        draw();
    }
    requestAnimationFrame(gameLoop);
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
        const characterY = gameHeight * 0.475;
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

        // Draw current username
        drawCurrentUsername();

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



    // Draw boost trail
    drawBoostTrail();



    // Draw bird with rotation and current image
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);

    // Determine which image to use based on velocity
    let imageToDraw;
    if (bird.velocity < -1) {
        imageToDraw = characterImages[gameplayCharacter].down;
    } else if (bird.velocity > 1) {
        imageToDraw = characterImages[gameplayCharacter].up;
    } else {
        imageToDraw = characterImages[gameplayCharacter].neutral;
    }

    if (gameplayCharacter === 'crump0') {
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


    // Draw sparkles for characters with the sparkle effect
    drawSparkles();
    drawSpeedSparkles();

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

    // Draw score - centered at the very top
    const scoreText = score.toString();
    drawTextWithOutline(scoreText, gameWidth / 2, 10, 'white', 'black', 3, '64px', 'bold', 'center', 'top');
    



    // Draw speed meter
    const SPEED_METER_WIDTH = 100;
    const SPEED_METER_HEIGHT = 10;
    const SPEED_METER_MARGIN = 10;
    const speedPercentage = (pipeSpeed - INITIAL_PIPE_SPEED) / (MAX_SPEED - INITIAL_PIPE_SPEED);
    const meterFillWidth = speedPercentage * SPEED_METER_WIDTH;

    // Position speed meter at bottom left
    const meterX = SPEED_METER_MARGIN;
    const meterY = gameHeight - SPEED_METER_MARGIN - SPEED_METER_HEIGHT;

    // Draw meter fill
    let fillColor = 'rgba(255, 0, 0, 0.7)';
    ctx.fillStyle = fillColor;
    ctx.fillRect(meterX, meterY, meterFillWidth, SPEED_METER_HEIGHT);

    // Draw boost indicator
    if (boosting) {
        const plusSize = SPEED_METER_HEIGHT; // Size of the plus symbol
        const plusX = meterX + meterFillWidth + 5; // 5 pixels to the right of the fill
        const plusY = meterY + SPEED_METER_HEIGHT / 2; // Centered vertically

        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // Draw the horizontal line of the plus
        ctx.beginPath();
        ctx.moveTo(plusX - plusSize/4, plusY);
        ctx.lineTo(plusX + plusSize/4, plusY);
        ctx.stroke();

        // Draw the vertical line of the plus
        ctx.beginPath();
        ctx.moveTo(plusX, plusY - plusSize/4);
        ctx.lineTo(plusX, plusY + plusSize/4);
        ctx.stroke();
    }

    // Draw meter border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, SPEED_METER_WIDTH, SPEED_METER_HEIGHT);

    // Draw speed label
    drawTextWithOutline('Speed', meterX, meterY - 5, 'white', 'black', 1, '16px', 'normal', 'left', 'bottom');

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

  // Draw best score with star icon - align right above the mode indicator
  const currentHighScore = hardModeActive ? hardModeHighScore : normalModeHighScore;
  const highScoreText = `★${currentHighScore}`;
  const highScoreX = modeImgX + modeImgWidth / 2; // Center over mode indicator
  const highScoreY = modeImgY; 
  drawTextWithShading(highScoreText, highScoreX, highScoreY, 'white', 'black', 1, '24px', 'normal', 'center', 'bottom');

    if (gameOver) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw "Game Over" text
        drawTextWithOutline('Game Over', gameWidth / 2, gameHeight * 0.2, '#FF4136', 'black', 3, '48px', 'bold', 'center', 'middle');

        // Draw Score and High Score
        drawTextWithOutline(`Score: ${score}`, gameWidth / 2, gameHeight * 0.3, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');
        drawTextWithOutline(`High Score: ${currentHighScore}`, gameWidth / 2, gameHeight * 0.35, '#FFFFFF', 'black', 2, '32px', 'normal', 'center', 'middle');

        // Draw current username
        drawCurrentUsername();

        // Draw question mark (moved outside the gameOver condition)
        drawQuestionMark();

        // Draw "Leaderboard" button (white background, black text)
        const leaderboardButtonWidth = 120;
        const leaderboardButtonHeight = 25;
        const leaderboardButtonX = (gameWidth - leaderboardButtonWidth) / 2;
        const leaderboardButtonY = gameHeight * 0.4;
        drawButton(leaderboardButtonX, leaderboardButtonY, leaderboardButtonWidth, leaderboardButtonHeight, 'Leaderboard', '#FFFFFF', '#000000', '18px');

        const elapsedTime = Date.now() - gameOverTime;
        if (elapsedTime < GAME_OVER_DELAY) {
            // Draw progress bar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, gameHeight - 5, (elapsedTime / GAME_OVER_DELAY) * gameWidth, 5);
        } else {
            // Draw gameplay character in the background
            const characterWidth = gameWidth * 0.2;
            const characterHeight = characterWidth;
            const characterX = (gameWidth - characterWidth) / 2;
            const characterY = gameHeight * 0.475;
            
            // Draw character selection UI on top
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

    if (showingLeaderboard && currentLeaderboardData) {
        displayLeaderboard(currentLeaderboardData);
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

// Function to draw text with background shading
function drawTextWithShading(text, x, y, fillStyle, strokeStyle, lineWidth, fontSize, fontWeight, align, baseline) {
    ctx.save();
    
    // Set up the font first to get accurate measurements
    ctx.font = `${fontWeight} ${fontSize} ${GAME_FONT}`;
    
    // Draw shading
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent black
    const padding = 0; // Reduced padding
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(fontSize); // Approximate height based on font size
    
    let rectX, rectY, rectWidth, rectHeight;
    
    if (align === 'center') {
        rectX = x - textWidth / 2 - padding;
        rectWidth = textWidth + padding * 2;
    } else if (align === 'right') {
        rectX = x - textWidth - padding;
        rectWidth = textWidth + padding * 2;
    } else {
        rectX = x - padding;
        rectWidth = textWidth + padding * 2;
    }
    
    if (baseline === 'top') {
        rectY = y - padding;
        rectHeight = textHeight + padding * 2;
    } else if (baseline === 'bottom') {
        rectY = y - textHeight - padding;
        rectHeight = textHeight + padding * 2;
    } else { // middle
        rectY = y - textHeight / 2 - padding;
        rectHeight = textHeight + padding * 2;
    }
    
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    
    // Draw text
    drawTextWithOutline(text, x, y, fillStyle, strokeStyle, lineWidth, fontSize, fontWeight, align, baseline);
    
    ctx.restore();
}

function hideCursor() {
    document.getElementById('gameCanvas').classList.add('playing');
    document.getElementById('gameCanvas').classList.remove('game-over');
}

function showCursor() {
    document.getElementById('gameCanvas').classList.remove('playing');
    document.getElementById('gameCanvas').classList.add('game-over');
}

// Event listeners for mouse and touch events
canvas.addEventListener('mousemove', function() {
    if (gameStarted && !gameOver) {
        hideCursor();
    }
});

// Event listeners for off-screen clicks and touches (Hello Rohan!)
document.addEventListener('click', function(event) {
    // Ignore clicks if a modal is open
    if (isModalOpen) return;

    // Only handle clicks when the game is in progress
    if (gameStarted && !gameOver) {
        // Check if the click is outside the canvas
        const rect = canvas.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) {
            jump();
            event.preventDefault(); // Prevent any default behavior
        }
    }
});

document.addEventListener('touchstart', function(event) {
    // Ignore touches if a modal is open
    if (isModalOpen) return;

    // Only handle touches when the game is in progress
    if (gameStarted && !gameOver) {
        // Check if the touch is outside the canvas
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        if (touch.clientX < rect.left || touch.clientX > rect.right ||
            touch.clientY < rect.top || touch.clientY > rect.bottom) {
            jump();
            event.preventDefault(); // Prevent any default behavior
        }
    }
}, { passive: false });

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
/*
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
*/

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
    const birdRadius = bird.width * 0.18; // Reduced from 0.23 to 0.2 
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