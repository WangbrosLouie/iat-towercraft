console.log("this is like a println(); kinda");

//var lastFrameTime = time();

setInterval(moveSquare, 1/60);

var playerX = 0;
var playerY = 0;
var keyList = {
    'w': false,
    'a': false,
    's': false,
    'd': false
};

function moveSquare() {

	var player = document.getElementById("player");	

	var style = player.style;

	if (keyList['a'] && !keyList['d']) {
        playerX--;
    } else if (!keyList['a'] && keyList['d']) {
        playerX++;
    }

	if (keyList['w'] && !keyList['s']) {
        playerY--;
    } else if (!keyList['w'] && keyList['s']) {
        playerY++;
    }
	
	style.left = playerX + "px";
	style.top = playerY + "px";
	print(style.left);
	
}

document.addEventListener("keydown", (event) => {
    const keyName = event.key;
    if (keyList[keyName] != undefined) {
        keyList[keyName] = true;
    }
    print(keyList[keyName]);

    console.log(keyName);
});

document.addEventListener("keyup", (event) => {
    const keyName = event.key;
    
    if (keyList[keyName] != undefined) {
        keyList[keyName] = false;
    }

    console.log(keyName);
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