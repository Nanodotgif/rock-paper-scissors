const playArea = document.getElementById("playArea");
const playWrapper = document.getElementById("playWrapper");
const winText = document.getElementById('winText');
const title = document.getElementById('title');
const screenHeight = getComputedStyle(playWrapper).height;
const screenWidth = getComputedStyle(playWrapper).width;
const numberOfPlayers = 100; // Number of players to compete
const movementSpeed = .9; // Speed at which players move
const playerSize = 50;
var players = [];
var rocks = [];
var papers = [];
var scissors = [];
var updateInterval = null;
var slowUpdateInterval = null;
var winner = '';

const Player = { // Object representing either a Rock, Paper, or Scissor
    element: null,
    type: 0,
    selfList: null,
    enemyList: null,
    attackerList: null,
    fleeing: false,
    x: 0,
    y: 0,

    init() {
        switch (this.type) {
            case 1:
                this.selfList = rocks;
                this.enemyList = scissors;
                this.attackerList = papers;
                break;
            case 2:
                this.selfList = papers;
                this.enemyList = rocks;
                this.attackerList = scissors;
                break;
            case 3:
                this.selfList = scissors;
                this.enemyList = papers;
                this.attackerList = rocks;
                break;
            default:
                break;
        }
    },

    update() {
        if (this.enemyList.length === 0) {
            this.target = getClosestTarget(this, this.attackerList);
            this.fleeing = true;
        } else {
            this.target = getClosestTarget(this, this.enemyList);
            this.fleeing = false;
        }
        if (this.target === null) { return };


        let movementVector = getMovementVector(this, this.target);
        if (this.fleeing === true) { movementVector.x *= -1; movementVector.y *= -1; };
        let newX = this.x + movementVector.x / this.target.distance * movementSpeed;
        let newY = this.y + movementVector.y / this.target.distance * movementSpeed;

        if (newX < 0 && movementVector.x < 0) { newX = this.x } else 
        if (newX > parseInt(screenWidth) - playerSize && movementVector.x > 0) { newX = this.x }

        if (newY < playerSize && movementVector.y < 0) { newY = this.y } else
        if (newY > parseInt(screenHeight) && movementVector.y > 0) { newY = this.y }

        placeElement(this, newX, newY)
    },

    slowUpdate() {
        for (var i = 0; i < this.attackerList.length; i++) {
            if (isColliding(this, this.attackerList[i])) {
                switch (this.type) {
                    case 1:
                        switchType(this, 2);
                        break;
                    case 2:
                        switchType(this, 3);
                        break;
                    case 3:
                        switchType(this, 1);
                    default:
                        break;
                }
            }
        }
    }

}

window.onload = Start();
function Start() { // To be executed once at the beginning of the game
    for (i = 0; i < numberOfPlayers; i++) {
        let currElement = document.createElement('p');
        let currType = getRandomInt(1,4);
        currElement.className = "type_"+currType;
        playArea.appendChild(currElement);

        let currPlayer = Object.create(Player); // Create a new player with a random type(Rock, Paper, or Scissors)
        currPlayer.element = currElement;
        currPlayer.type = currType;

        switch (currType) { // Assign the newly created player to it's corresponding array, representing different teams
            case 1:
                rocks.push(currPlayer);
                break;
            case 2:
                papers.push(currPlayer);
                break;
            case 3:
                scissors.push(currPlayer);
            default:
                break;
        }
        currPlayer.init();
        // Assign a random possition to the player
        currElement.style.left = getRandomInt(30, parseFloat(screenWidth) -30) + "px";
        currElement.style.top = getRandomInt(30, parseFloat(screenHeight) -30) + "px";
        players.push(currPlayer);
    }
    updatePositions();
    updateInterval = setInterval(Update, 30/1000);
    slowUpdateInterval = setInterval(SlowUpdate, 5/1000);
}





function Update() { // Handles movement and other features that require evealuation every frame
    title.innerText = rocks.length+"🗿 | "+papers.length+"📜 | "+scissors.length+"✂️";
    if (players.length === rocks.length) { winner = 'Rocks win!'; stop() } else
    if (players.length === papers.length) { winner = 'Papers win!'; stop() } else
    if (players.length === scissors.length) { winner = 'Scissors win!'; stop() }
    winText.innerText = winner;

    for (var i = 0; i < rocks.length; i++) {
        rocks[i].update();
    }
    for (var i = 0; i < papers.length; i++) {
        papers[i].update();
    }
    for (var i = 0; i < scissors.length; i++) {
        scissors[i].update();
    }

}

function SlowUpdate() { // Handles more expensive computations such as collision detection at a slower interval
    for (var i = 0; i < rocks.length; i++) {
        rocks[i].slowUpdate();
    }
    for (var i = 0; i < papers.length; i++) {
        papers[i].slowUpdate();
    }
    for (var i = 0; i < scissors.length; i++) {
        scissors[i].slowUpdate();
    }
}



function placeElement(e, x, y) { // Places an element e at position (x,y)
    if (x > parseFloat(screenWidth)) {
        return;
    }
    e.element.style.top= parseFloat(screenHeight) - y +"px";
    e.element.style.left= x +"px";
    e.x = parseFloat(e.element.style.left);
    e.y = parseFloat(screenHeight) - parseFloat(e.element.style.top);
}

function getRandomInt(min, max) { // Returns a random integer between min and max
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


function isColliding(a, b) { // Returns true if the bounding areas of elements a and b overlap

    return !(
        ((a.y + playerSize) < (b.y)) ||
        (a.y > (b.y + playerSize)) ||
        ((a.x + playerSize) < b.x) ||
        (a.x > (b.x + playerSize))
    );
}

function updatePositions() {
    for (var i = 0; i < numberOfPlayers; i++) {
        players[i].x = parseFloat(players[i].element.style.left);
        players[i].y = parseFloat(screenHeight) - parseFloat(players[i].element.style.top);
    }
}

function getClosestTarget(player, targetList) { // Returns the closest player of targetList(the enemy team) to player
    var closestTarget = null;
    for (var i = 0; i < targetList.length; i++) {
        if (closestTarget === null) { closestTarget = targetList[i]};
        
        let testTargetDistance = getDistance(player, targetList[i]);
        
        if (testTargetDistance === 0) { return };
        
        let closestTargetDistance = getDistance(player, closestTarget);

        if (testTargetDistance < closestTargetDistance) {
            closestTarget = targetList[i];
        }
    }
    closestTarget.distance = getDistance(player, closestTarget);
    return closestTarget;
}

function getDistance(object1, object2) { // Returns the distance between object1 and object2
    let x = object1.x - object2.x;
    let y = object1.y - object2.y;
    return Math.sqrt(x*x + y*y);
}

function getMovementVector(player, target) {
    var tx = target.x - player.x;
        ty = target.y - player.y;
        distance = getDistance(player, target);
        x = tx/distance;
        y = ty/distance;
        vector = {x: tx, y: ty};
    return vector;
}

function switchType(player, typeID) { // Switches the team of player to that represented by typeID
    player.type = typeID;
    player.element.className = "type_"+typeID;
    player.selfList.splice(player.selfList.indexOf(player), 1);
    switch (typeID) {
        case 1:
            rocks.push(player);
            break;
        case 2:
            papers.push(player);
            break;
        case 3:
            scissors.push(player);
        default:
            break;
    }
    player.init();
}

function stop() {
    clearInterval(updateInterval);
    clearInterval(slowUpdateInterval);
}


