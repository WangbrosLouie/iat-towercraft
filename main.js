const version = "0.7.0";

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
var maxMaterials = 20;
var spotList = [];
const buildTime = frameRate;
const materialTime = frameRate/2;

var windowScale = 1;
var borderX = 0;
var borderY = 0;
var highContrast = false;
var frame;
var frameStyle;
var shop;
var options;
var messageList;
var mobileControls;
var mobileControlsUp;
var mobileControlsLeft;
var mobileControlsRight;
var mobileControlsDown;
var mobileShop;
var mobileOptions;

var menuOpenTime = 0;
var menuOpen = false;
var shopOpen = false;
var shopMoney;
var shopMaterials;
var optionsOpen = false;
var optionsContrast;
var optionsMobile;

var mobileControlsEnabled = false;
var mobileUp = false;
var mobileLeft = false;
var mobileRight = false;
var mobileDown = false;
var mobileControlsEnabler;

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
        // this.element.style.position = "absolute";
        // this.element.style.zIndex = 30;
        this.element.style.left = transX(this.X) + "px";
        this.element.style.top = transY(this.Y) + "px";
        this.element.style.width = playerSize * windowScale + "px";
        this.element.style.height =  playerSize * windowScale + "px";
        this.element.classList.add("spot");
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
        this.element.src = "assets/buildspotnew.png";
        document.getElementById("frame").appendChild(this.element);
    }
}

class MaterialSpot extends Spot {
    constructor(X,Y) {
        super(X,Y,"material");
        this.element.src = "assets/wood5.png";
        this.remaining = 5;
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
    options = document.getElementById("options");
    optionsContrast = document.getElementById("optionsContrast");
    optionsMobile = document.getElementById("optionsMobile");

    mobileControls = document.getElementById("mobileControls");
    mobileControlsUp = document.getElementById("mobileUp");
    mobileControlsLeft = document.getElementById("mobileLeft");
    mobileControlsRight = document.getElementById("mobileRight");
    mobileControlsDown = document.getElementById("mobileDown");
    mobileShop = document.getElementById("mobileShop");
    mobileOptions = document.getElementById("mobileOptions");
    mobileControlsEnabler = document.getElementById("mobileControlsEnabler");

    windowResized();
    setInterval(loop, 1000/frameRate);

    document.getElementById("warning").remove(); // if all goes well, remove the error warning

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    mobileShop.addEventListener("click", toggleShop);
    mobileOptions.addEventListener("click", toggleOptions);

    displayMessage("Towercraft v" + version);
    document.title = "Towercraft v" + version;

    displayMessage("this is a message. it will fade away after 10 seconds, so be sure to read them quickly!")
    displayMessage("High Contrast Mode in Options (press O)").firstElementChild.classList.add("hcmessage");
    displayMessage("Enable mobile controls by tapping the screen")

}

function loop() {
    moveSquare();
    checkCollisions();
    if (shopOpen) updateShop();
    else if (optionsOpen) updateOptions();
    else processGame();
    updateUI();
}

function moveSquare() {
    /*var horiMove = (keyList['a']||mobileLeft) ^ (keyList['d']||mobileRight);
    var vertMove = (keyList['w']||mobileUp) ^ (keyList['s']||mobileDown);

    const oldX = playerX;
    const oldY = playerY;

	if ((keyList['a']||mobileLeft) && !(keyList['d']||mobileRight)) {
        playerX -= (2-vertMove)*moveSpeed/frameRate;
    } else if (!(keyList['a']||mobileLeft) && (keyList['d']||mobileRight)) {
        playerX += (2-vertMove)*moveSpeed/frameRate;
    }

	if ((keyList['w']||mobileUp) && !(keyList['s']||mobileDown)) {
        playerY -= (2-horiMove)*moveSpeed/frameRate;
    } else if (!(keyList['w']||mobileUp) && (keyList['s']||mobileDown)) {
        playerY += (2-horiMove)*moveSpeed/frameRate;
    }*/

    var horiMove = (keyList['d']||mobileRight) - (keyList['a']||mobileLeft);
    var vertMove = (keyList['s']||mobileDown) - (keyList['w']||mobileUp);
    const oldX = playerX;
    const oldY = playerY;
    playerX += (2-Math.abs(vertMove))*moveSpeed*horiMove/frameRate;
    playerY += (2-Math.abs(horiMove))*moveSpeed*vertMove/frameRate;

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
                        materials++;
                        spot.remaining--;
                        if (spot.remaining <=0) {
                            spotList.splice(i, 1);
                            spot.destroy();
                            spotList.push(new MaterialSpot(Math.floor(Math.random()*(windowX-playerSize)),Math.floor(Math.random()*(windowY-playerSize))));
                            i--;
                        } else {
                            spot.framesIn = 0;
                            spot.element.src = "assets/wood" + spot.remaining + ".png";
                        }
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

    statusUI.innerHTML = "Build Percent: " + buildpct + "%, Materials: " + materials + "/" + maxMaterials + ", Money: $" + money;
    tower.innerHTML = "Floors: " + floors + timer;

}

function toggleMenu(open) {

    menuOpen = open;
    if (menuOpen) {
        document.removeEventListener("keydown",keyDown);
        document.removeEventListener("keyup",keyUp);
        menuOpenTime = Date.now();
        mobileControls.style.display = "none";
        mobileControlsEnabler.style.display = "none";
    } else {
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
        buildStartTime += Date.now() - menuOpenTime;
        if(mobileControlsEnabled)mobileControls.style.display = "block";else mobileControlsEnabler.style.display = "block";
    }
}

function toggleShop() {
    
    shopOpen = !shopOpen;
    if (shopOpen) {
        document.addEventListener("keydown", shopKeyDown);
        document.addEventListener("keyup", shopKeyUp);
        shop.style.display = "block";
    } else {
        document.removeEventListener("keydown",shopKeyDown);
        document.removeEventListener("keyup",shopKeyUp);
        shop.style.display = "none";
    }
    toggleMenu(shopOpen);

}

function toggleOptions() {
    
    optionsOpen = !optionsOpen;
    if (optionsOpen) {
        document.addEventListener("keydown", optionsKeyDown);
        // document.addEventListener("keyup", optionsKeyUp);
        options.style.display = "block";
    } else {
        document.removeEventListener("keydown",optionsKeyDown);
        // document.removeEventListener("keyup",optionsKeyUp);
        options.style.display = "none";
    }
    toggleMenu(optionsOpen);

}

function buyMaterials() {
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
    options.style.inset = transY(50) + "px " + transX(100) + "px";

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

    mobileControlsUp.style.inset = transY(250) + "px " + transX(650) + "px " + transY(150) + "px " + transX(100) + "px";
    mobileControlsLeft.style.inset = transY(300) + "px " + transX(700) + "px " + transY(100) + "px " + transX(50) + "px";
    mobileControlsRight.style.inset = transY(300) + "px " + transX(600) + "px " + transY(100) + "px " + transX(150) + "px";
    mobileControlsDown.style.inset = transY(350) + "px " + transX(650) + "px " + transY(50) + "px " + transX(100) + "px";
    mobileControlsUp.style.lineHeight = 50 * windowScale + "px";
    mobileControlsLeft.style.lineHeight = 50 * windowScale + "px";
    mobileControlsRight.style.lineHeight = 50 * windowScale + "px";
    mobileControlsDown.style.lineHeight = 50 * windowScale + "px";
}

function displayMessage(msg) {

    let messageWrapper = document.createElement("div");
    let message = document.createElement("span");
    message.innerHTML = msg;
    message.className = "gameMessage";
    messageWrapper.appendChild(message);
    messageList.appendChild(messageWrapper);
    let animFrame = 0;
    setTimeout((event) => {
        let interval = setInterval((event) => {message.style.opacity = 1-(animFrame/frameRate);animFrame++}, 1000/frameRate);
        setTimeout((event)=>{clearInterval(interval);message.remove();}, 1000)
    }, 9000);
    return messageWrapper;

}

function displayWarning(msg) { //this is like display message but only 1 warning at a time, has its own box on the screen, use this for tutorial or errors

}

function updateShop() {
    shopMoney.innerHTML = "Money: $" + money;
    shopMaterials.innerHTML = "Materials: " + materials + "/" + maxMaterials;
}

function updateOptions() {
    optionsContrast.innerHTML = "[" + (highContrast?"X":"_") + "] (H)igh Contrast";
    optionsMobile.innerHTML = "[" + (mobileControlsEnabled?"X":"_") + "] (M)obile Controls"
}

function toggleContrast(high) {
    var elements = document.getElementsByTagName("*");
    if (high) {
        for (var element of elements) {
            element.classList.add("hc");
        }
    } else {
        for (var element of elements) {
            element.classList.remove("hc");
        }
    }
}

function toggleMobile(enabled) {
    if (enabled) {
        mobileControlsEnabler.style.display = "none";
        if(!optionsOpen)mobileControls.style.display = "block"
        displayMessage("Mobile controls enabled.")
        displayMessage("Press on left side of screen for shop,")
        displayMessage("right side for options.");
    } else {
        if(!optionsOpen)mobileControlsEnabler.style.display = "block";
        mobileControls.style.display = "none"
    }
}

function transX(x) {
    return x*windowScale+borderX;
}

function transY(y) {
    return y*windowScale+borderY;
}

// KEYBOARD RELATED FUNCTIONS -------------------------------------------------

function keyDown(event) {
    const keyName = event.key.toLowerCase();
    if (keyName == 'b') {
        toggleShop();
    } else if (keyName == 'o') {
        toggleOptions();
    } else if (keyList[keyName] != undefined) {
        keyList[keyName] = true;
    }
}

function keyUp(event) {
    const keyName = event.key.toLowerCase();
    if (keyList[keyName] != undefined) {
        keyList[keyName] = false;
    }
}

function shopKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'b':
            toggleShop();
            break;
        case '1':
            buyMaterials();
            break;
    }
}

function shopKeyUp(event) {
    switch (event.key.toLowerCase()) {
        case '1':
            break;
    }
}

function optionsKeyDown(event) {
    switch (event.key.toLowerCase()) {
        case 'o':
            toggleOptions();
            break;
        case 'h':
            highContrast = !highContrast;
            toggleContrast(highContrast);
            break;
        case 'm':
            mobileControlsEnabled = !mobileControlsEnabled;
            toggleMobile(mobileControlsEnabled);
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