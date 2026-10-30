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

var windowScale = 1;
var borderX = 0;
var borderY = 0;

function main() {

    player = document.getElementById("player"); //note: player is 25x25 ingame pixels
    playerStyle = player.style;
    windowResized();
    setInterval(moveSquare, 1000/frameRate);

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

// WINDOW RELATED FUNCTIONS ---------------------------------------------------

addEventListener("resize", windowResized);
function windowResized() {
    resizeWindow(window.innerWidth, window.innerHeight);
}

function resizeWindow(w, h) {

    var frame = document.getElementById("frame");
    // var frame = document.body;
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

        playerStyle.width = playerSize * windowScale + "px";
        playerStyle.height =  playerSize * windowScale + "px";

    } else { //clamp window size by height

        windowScale = h/450;
        var newW = h*16/9;
        borderX = (w-newW)/2;
        borderY = 0;

        frameStyle.margin =  "0 " + borderX + "px";
        frameStyle.width = newW + "px";
        frameStyle.height = h + "px";

        playerStyle.width = playerSize * windowScale + "px";
        playerStyle.height =  playerSize * windowScale + "px";
    }

    playerStyle.left = transX(playerX) + "px";
    playerStyle.top = transY(playerY) + "px";
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

/* to-do

	scan keypresses
	react to keypresses
	make a box element (temp player)
	make it move around with wasd or arrows
	
*/

function print(thing) {
    console.log(thing);
}

function clamp(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}