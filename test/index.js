const BG_COLOUR = '#231f20';
const RACKET_COLOUR = '#c2c2c2';
const BALL_COLOUR = '#e66916';

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMSIsImZ0SWQiOiIxIiwidXNlcm5hbWUiOiJBX3VzZXIifQ.3GrurQz8RZ3CghTnXcJIHulU6KMQXHXj7XL6adY_NJg
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMiIsImZ0SWQiOiIyIiwidXNlcm5hbWUiOiJCX3VzZXIifQ.diAuyuEuB90hgzH4A4gbcwk4GyQ45w7R3QF0UKMiXio
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMyIsImZ0SWQiOiIzIiwidXNlcm5hbWUiOiJDX3VzZXIifQ.zKQs-ZTDK3JCrou_ojapbL7NtJqXhEzOVbKCR0nJ-uk
let token = prompt('Token', '');

if (token === 'A') {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMSIsImZ0SWQiOiIxIiwidXNlcm5hbWUiOiJBX3VzZXIifQ.3GrurQz8RZ3CghTnXcJIHulU6KMQXHXj7XL6adY_NJg';
} else if (token === 'B') {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMiIsImZ0SWQiOiIyIiwidXNlcm5hbWUiOiJCX3VzZXIifQ.diAuyuEuB90hgzH4A4gbcwk4GyQ45w7R3QF0UKMiXio';
} else if (token === 'C') {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMyIsImZ0SWQiOiIzIiwidXNlcm5hbWUiOiJDX3VzZXIifQ.zKQs-ZTDK3JCrou_ojapbL7NtJqXhEzOVbKCR0nJ-uk';
}

const socket = io('http://localhost:3003', {
    extraHeaders: {
        Authorization: `Bearer ${token}`
    }
});

socket.on('game-code', handleGameCode);
socket.on('game-init', handleInit);
socket.on('game-state', handleGameState);
socket.on('game-over', handleGameOver);

socket.on('matchmaking-time', handleMatchmakingTime);
socket.on('matchmaking-success', handleMatchmakingSuccess);
socket.on('matchmaking-failed', handleMatchmakingFailed);
socket.on('matchmaking-wait-for-players', handleWaitForPlayersTimer);
socket.on('matchmaking-init', init);
socket.on('matchmaking-declined', handleDecline);
socket.on('matchmaking-restart', handleMatchmakingRestart);

socket.on('exception', handleException);


const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const matchmakingButton = document.getElementById('matchmakingButton');
const matchmakingCancelButton = document.getElementById('matchmakingCancelButton');
const matchmakingAcceptButton = document.getElementById('matchmakingAcceptButton');
const matchmakingTimer = document.getElementById('matchmakingTime');
const alert_fail = document.getElementById('matchmakingAlertFail');
const alert_success = document.getElementById('matchmakingAlertSuccess');

const spectateButton = document.getElementById('spectateGameButton');
const spectateCodeInput = document.getElementById('spectateCodeInput');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
matchmakingButton.addEventListener('click', matchmaking);
matchmakingCancelButton.addEventListener('click', cancel);
matchmakingAcceptButton.addEventListener('click', acceptGame);
spectateButton.addEventListener('click', spectateGame);

function  newGame() {
    socket.emit('new-game');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('join-game', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    alert_success.hidden = true; // добавил
    alert_fail.hidden = true; //

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keyDown', e.keyCode);
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ball = state.ball;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize;

    ctx.fillStyle = BALL_COLOUR;
    ctx.fillRect(ball.position.x * size, ball.position.y * size, size, size);

    paintPlayer(state.players[0], size, RACKET_COLOUR);
    paintPlayer(state.players[1], size, RACKET_COLOUR);
}

function paintPlayer(playerState, size, colour) {
    ctx.fillStyle = colour

    for (let i = 0; i < playerState.size; i++) {
        ctx.fillRect(playerState.position.x * size, (playerState.position.y + i) * size, size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);

    if (playerNumber === 1 || playerNumber === 2) {
        if (data.winner === playerNumber) {
            alert('You win!');
        } else {
            alert('You lose.');
        }
    } else {
        alert('Player ' + data.winner + ' win!');
    }
    gameActive = false;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleException(error) {
    reset();
    alert(error);
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}


//////////////////////////////Matchmaking///////////////////////////////////////////////////////////////////////////////


function matchmakingView(isMatchmakingActive, timeStr) {
    matchmakingButton.hidden = isMatchmakingActive;
    matchmakingCancelButton.hidden = !isMatchmakingActive;
    if (timeStr) {
        matchmakingTimer.innerText = timeStr;
    }
}

function matchmaking() {
    alert_fail.hidden = true;
    socket.emit('matchmaking-add-in-queue');
    matchmakingView(true, null);
}

function handleMatchmakingFailed() {
    alert_fail.innerText = 'Matchmaking timeout! Try again';
    alert_fail.hidden = false;
    matchmakingView(false, "00:00");
}

function handleMatchmakingTime(time) {
    time = Math.floor(time) / 1000;
    let minutes = Math.trunc(time / 60);
    let seconds = Math.trunc(time % 60);

    let result = '';
    if (minutes < 10) {
        result += '0' + minutes.toString();
    } else {
        result += minutes.toString();
    }
    result += ':';
    if (seconds < 10) {
        result += '0' + seconds.toString();
    } else {
        result += seconds.toString();
    }
    matchmakingView(true, result);
}

function handleMatchmakingSuccess() {
    console.log('SUCCESS');
    alert_success.hidden = false;
    alert_success.innerText = "Waiting for players: 10";
    matchmakingView(true, null);
    matchmakingAcceptButton.hidden = false;
}

function handleWaitForPlayersTimer(time) {
    time = (10 - Math.floor(time / 1000));
    alert_success.innerText = "Waiting for players: " + time;
    if (time <= 0) {
        alert_success.hidden = true;
        alert_fail.hidden = false;
        alert_fail.innerText = "Matchmaking failed!";
        matchmakingView(false, '00:00');
    }
}

function cancel() {
    socket.emit('matchmaking-decline-game');
}

function acceptGame() {
    socket.emit('matchmaking-accept-game');
}

function handleDecline() {
    matchmakingView(false, '00:00');
    matchmakingAcceptButton.hidden = true;
    alert_success.hidden = true;
}

function handleMatchmakingRestart() {
    matchmakingView(false, '00:00');
    matchmakingAcceptButton.hidden = true;
    alert_success.hidden = true;
    matchmaking();
}

//////////////////////////////SPECTATE//////////////////////////////////////////////////////////////////////////////////

function spectateGame() {
    const code = spectateCodeInput.value;
    socket.emit('spectate-game', code);
    initSpectate();
}

function initSpectate() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameActive = true;
}