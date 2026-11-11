const version = "0.4.0";

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
var statusUI;
var floors = 0;
var buildpct = 0;
var buildStartTime = 0;
var building = false;
var money = 10;
var materials = 10;
var spotList = [];
const buildTime = frameRate;
const materialTime = 1;

var windowScale = 1;
var borderX = 0;
var borderY = 0;
var frame;
var frameStyle;
var shop;
var messageList;

var shopOpen = false;
var shopOpenTime = 0;
var shopMoney;
var shopMaterials;
var keyDownEvent;
var keyUpEvent;
var shopKeyDownEvent;
var shopKeyUpEvent;

class Spot {
    constructor(X,Y,type) {
        this.element = document.createElement("img");
        this.X = X;
        this.Y = Y;
        this.type = type;
        this.width = playerSize;
        this.height = playerSize;
        this.framesIn = 0; //how many frames has the player been inside
        this.hoveredLastFrame = false; //if the player was inside last frame
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

    playerOverlapping() {
        return playerX+playerSize>this.X && playerX<this.X+this.width && playerY+playerSize>this.Y && playerY<this.Y+this.width;
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
    statusUI = document.getElementById("status");

    tower.style.display = "inline";
    spotList.push(new BuildSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
    spotList.push(new MaterialSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));

    frame = document.getElementById("frame");
    frameStyle = frame.style;
    shop = document.getElementById("shop");
    shopMoney = document.getElementById("shopMoney");
    shopMaterials = document.getElementById("shopMaterials");
    messageList = document.getElementById("messageList");

    windowResized();
    setInterval(loop, 1000/frameRate);

    document.getElementById("warning").remove(); // if all goes well, remove the error warning

    displayMessage("Towercraft v" + version);
    document.title = "Towercraft v" + version;

    displayMessage("this is a message. it will fade away after 5 seconds, so be sure to read them quickly!")

}

function loop() {
    moveSquare();
    checkCollisions();
    if (shopOpen) updateShop();
    else processGame();
    updateUI();
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
                if (spot.playerOverlapping()) {
                    if(materials>=5)spot.framesIn++;
                    if (spot.framesIn >= buildTime) {
                        spotList.splice(i, 1);
                        spot.destroy();
                        buildpct += 25;
                        materials -= 5;
                        spotList.push(new BuildSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
                        i--;
                        if (!building) {
                            building = true;
                            buildStartTime = Date.now();
                        }
                    }
                }
                break;
            case "material":
                if (spot.playerOverlapping()) {
                    spot.framesIn++
                    if (spot.framesIn >= materialTime) {
                        spotList.splice(i, 1);
                        spot.destroy();
                        materials++;
                        spotList.push(new MaterialSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
                        i--;
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
        money += (building && Date.now()-buildStartTime<10000) ?10:5;
        displayMessage("+ $"+((building && Date.now()-buildStartTime<10000) ?10:5));
        building = false;
    }

}

function updateUI() {

    var timer = (building && Date.now()-buildStartTime<10000)?"<br><br>Time Left<br>for bonus:<br>"+((buildStartTime+10000-Date.now())/1000)+" seconds":"";

    statusUI.innerHTML = "Build Percent: " + buildpct + "%, Materials: " + materials + "/20, Money: $" + money;
    tower.innerHTML = "Floors: " + floors + timer;

}

function toggleShop() {
    
    if (shopOpen) {
        document.addEventListener("keydown", shopKeyDown);
        document.addEventListener("keyup", shopKeyUp);
        shop.style.display = "block";
        shopOpenTime = Date.now();
    } else {
        document.removeEventListener("keydown",shopKeyDown);
        document.removeEventListener("keyup",shopKeyUp);
        shop.style.display = "none";
        buildStartTime += Date.now() - shopOpenTime;
    }

}

// WINDOW RELATED FUNCTIONS ---------------------------------------------------

addEventListener("resize", windowResized);
function windowResized() {
    resizeWindow(window.innerWidth, window.innerHeight);
}

function resizeWindow(w, h) {

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

        messageList.style.left = "0";
        messageList.style.top = borderY + "px";

    } else { //clamp window size by height

        windowScale = h/450;
        var newW = h*16/9;
        borderX = (w-newW)/2;
        borderY = 0;

        frameStyle.width = newW + "px";
        frameStyle.height = h + "px";

        messageList.style.left = borderX + "px";
        messageList.style.top = "0";

    }

    frameStyle.margin = borderY + "px " + borderX + "px";
    shop.style.inset = transY(50) + "px " + transX(100) + "px";

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

function displayMessage(msg) {

    let message = document.createElement("div");
    message.innerHTML = msg;
    message.className = "gameMessage";
    messageList.appendChild(message);
    let animFrame = 0;
    setTimeout((event) => {
        let interval = setInterval((event) => {message.style.opacity = 1-(animFrame/frameRate);animFrame++}, 1000/frameRate);
        setTimeout((event)=>{clearInterval(interval);message.remove();}, 1000)
    }, 4000);

}

function displayWarning(msg) { //this is like display message but only 1 warning at a time, has its own box on the screen, use this for tutorial or errors

}

function updateShop() {
    shopMoney.innerHTML = "Money: $" + money;
    shopMaterials.innerHTML = "Materials: " + materials + "/20";
}

function transX(x) {
    return x*windowScale+borderX;
}

function transY(y) {
    return y*windowScale+borderY;
}

// KEYBOARD RELATED FUNCTIONS -------------------------------------------------

keyDownEvent = document.addEventListener("keydown", (event) => {
    const keyName = event.key.toLowerCase();
    if (keyName == 'b') {
        shopOpen = !shopOpen;
        toggleShop();
    } else if (keyList[keyName] != undefined) {
        keyList[keyName] = true;
    }
});

keyUpEvent = document.addEventListener("keyup", (event) => {
    const keyName = event.key.toLowerCase();
    if (keyList[keyName] != undefined) {
        keyList[keyName] = false;
    }
});

function shopKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case '1':
            if (money >= 10 && materials<=10) {
                materials += 10;
                money -= 10;
                displayMessage("Bought 10 materials");
                displayMessage("+ 10 materials");
                displayMessage("- $10");
            } else if (materials > 10) {
                displayMessage("You have too many resources!")
            } else {
                displayMessage("You don't have enough money!");
            }
            break;
    }
}

function shopKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case '1':
            break;
    }
}

// MISC FUNCTIONS -------------------------------------------------------------

function print(thing) {
    console.log(thing);
}

function clamp(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}