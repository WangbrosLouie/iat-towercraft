const windowX = 800;
const windowY = 450;

var frameRate = 60;
var moveSpeed = 300;
var playerSize = 50;

var player;
var playerStyle;
var playerX = Math.floor(windowX/2-playerSize/2);
var playerY = Math.floor(windowY/2-playerSize/2);
var keyList = {
    'w': false,
    'a': false,
    's': false,
    'd': false
};

var tower;
var statuss;
var floors = 0;
var buildpct = 0;
var money = 10;
var materials = 10;
var spotList = [];
const buildTime = frameRate;
const materialTime = 1;

var windowScale = 1;
var borderX = 0;
var borderY = 0;

class Spot {
    constructor(X,Y,type) {
        this.element = document.createElement("img");
        this.X = X;
        this.Y = Y;
        this.type = type;
        this.width = playerSize;
        this.height = playerSize;
        this.framesIn = 0; //how many frames has the player been inside
        this.element.style.position = "absolute";
        this.element.style.zIndex = 80;
        this.element.style.left = transX(this.X) + "px";
        this.element.style.top = transY(this.Y) + "px";
        this.element.style.width = playerSize * windowScale + "px";
        this.element.style.height =  playerSize * windowScale + "px";
    }

    updateView() {
        this.element.style.left = transX(this.X) + "px";
        this.element.style.top = transY(this.Y) + "px";
        this.element.style.width = playerSize * windowScale + "px";
        this.element.style.height =  playerSize * windowScale + "px";
    }

    destroy() {
        this.element.remove();
        // this = null;
    }
}

class BuildSpot extends Spot {
    constructor(X,Y) {
        super(X,Y,"build");
        this.element.src = "assets/buildspot.png";
        document.getElementById("frame").appendChild(this.element);
    }
}

class MaterialSpot extends Spot {
    constructor(X,Y) {
        super(X,Y,"material");
        this.element.src = "assets/wood.png";
        document.getElementById("frame").appendChild(this.element);
    }
}


function main() {

    player = document.getElementById("player"); //note: player is 25x25 ingame pixels
    playerStyle = player.style;
    tower = document.getElementById("tower");
    statuss = document.getElementById("status");

    spotList.push(new BuildSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
    spotList.push(new MaterialSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));

    windowResized();
    setInterval(loop, 1000/frameRate);

}

function loop() {
    moveSquare();
    checkCollisions();
    processGame();
}

function moveSquare() {

    var horiMove = keyList['a'] ^ keyList['d'];
    var vertMove = keyList['w'] ^ keyList['s'];

    const oldX = playerX;
    const oldY = playerY;

	if (keyList['a'] && !keyList['d']) {
        playerX -= (2-vertMove)*moveSpeed/frameRate;
    } else if (!keyList['a'] && keyList['d']) {
        playerX += (2-vertMove)*moveSpeed/frameRate;
    }

	if (keyList['w'] && !keyList['s']) {
        playerY -= (2-horiMove)*moveSpeed/frameRate;
    } else if (!keyList['w'] && keyList['s']) {
        playerY += (2-horiMove)*moveSpeed/frameRate;
    }

    playerX = clamp(playerX, 0, windowX-playerSize); //window x is 0 to 800
    playerY = clamp(playerY, 0, windowY-playerSize); //window y is 0 to 450
	
	if(oldX!=playerX)playerStyle.left = transX(playerX) + "px";
	if(oldY!=playerY)playerStyle.top = transY(playerY) + "px";
	
}

function checkCollisions() {

    var i = 0;
    while (i < spotList.length) {
        var spot = spotList[i];
        switch (spot.type) {
            case "build":
                if (playerX+playerSize>spot.X && playerX<spot.X+spot.width && playerY+playerSize>spot.Y && playerY<spot.Y+spot.width) {
                    if(materials>=5)spot.framesIn++;
                    if (spot.framesIn >= buildTime) {
                        spotList.splice(i, 1);
                        spot.destroy();
                        buildpct += 25;
                        materials -= 5;
                        spotList.push(new BuildSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
                    }
                }
                break;
            case "material":
                if (playerX+playerSize>spot.X && playerX<spot.X+spot.width && playerY+playerSize>spot.Y && playerY<spot.Y+spot.width) {
                    spot.framesIn++
                    if (spot.framesIn >= materialTime) {
                        spotList.splice(i, 1);
                        spot.destroy();
                        materials++;
                            spotList.push(new MaterialSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
                    }
                }
                break;
            default:
                print("oh noes");
        }
        i++;
    }

}

function processGame() {

    if (buildpct >= 100) {
        floors++;
        buildpct = 0;
    }

    statuss.innerHTML = "Build Percent: " + buildpct + "%, Materials: " + materials;
    tower.innerHTML = "Floors: " + floors;

}

// WINDOW RELATED FUNCTIONS ---------------------------------------------------

addEventListener("resize", windowResized);
function windowResized() {
    resizeWindow(window.innerWidth, window.innerHeight);
}

function resizeWindow(w, h) {

    var frame = document.getElementById("frame");
    var frameStyle = frame.style;

    //cut off subpixels
    w = Math.floor(w);
    h = Math.floor(h);

    if (w*9 < h*16) { //clamp window size by width

        windowScale = w/800;
        var newH = w*9/16;
        borderX = 0;
        borderY = (h-newH)/2;
        
        frameStyle.width = w + "px";
        frameStyle.height = newH + "px";
        frameStyle.margin = borderY + "px 0";

    } else { //clamp window size by height

        windowScale = h/450;
        var newW = h*16/9;
        borderX = (w-newW)/2;
        borderY = 0;

        frameStyle.margin =  "0 " + borderX + "px";
        frameStyle.width = newW + "px";
        frameStyle.height = h + "px";

    }

    playerStyle.width = playerSize * windowScale + "px";
    playerStyle.height =  playerSize * windowScale + "px";
    playerStyle.left = transX(playerX) + "px";
    playerStyle.top = transY(playerY) + "px";

    for (var spot of spotList) {
        spot.updateView();
    }

    tower.style.width = 100 * windowScale + "px";
    tower.style.height = 100 * windowScale + "px";
    tower.style.left = transX(350) + "px";
    tower.style.top = transY(175) + "px";
}

function transX(x) {
    return x*windowScale+borderX;
}

function transY(y) {
    return y*windowScale+borderY;
}

// KEYBOARD RELATED FUNCTIONS -------------------------------------------------

document.addEventListener("keydown", (event) => {
    const keyName = event.key.toLowerCase();
    if (keyList[keyName] != undefined) {
        keyList[keyName] = true;
    }
});

document.addEventListener("keyup", (event) => {
    const keyName = event.key.toLowerCase();
    if (keyList[keyName] != undefined) {
        keyList[keyName] = false;
    }
});

// MISC FUNCTIONS -------------------------------------------------------------

function print(thing) {
    console.log(thing);
}

function clamp(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}