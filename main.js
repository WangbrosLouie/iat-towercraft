console.log("this is like a println(); kinda");

//var lastFrameTime = time();

setInterval(moveSquare, 1/60);

var playerX = 50;
var playerY = 50;
var keyList = {
    'w': false,
    'a': false,
    's': false,
    'd': false
};

function moveSquare() {

	var player = document.getElementById("player");	

	var style = player.style;

    var horiMove = keyList['a'] ^ keyList['d'];
    var vertMove = keyList['w'] ^ keyList['s'];

    print(horiMove + " " + vertMove);

	if (keyList['a'] && !keyList['d']) {
        //playerX -= horiMove?1:2;
        playerX -= 2-vertMove;
    } else if (!keyList['a'] && keyList['d']) {
        //playerX += horiMove?1:2;
        playerX += 2-vertMove;
    }

	if (keyList['w'] && !keyList['s']) {
        //playerY -= vertMove?1:2;
        playerY -= 2-horiMove;
    } else if (!keyList['w'] && keyList['s']) {
        //playerY += vertMove?1:2;
        playerY += 2-horiMove;
    }
	
	style.left = playerX + "px";
	style.top = playerY + "px";
	
}

document.addEventListener("keydown", (event) => {
    const keyName = event.key;
    if (keyList[keyName] != undefined) {
        keyList[keyName] = true;
    }

    //console.log(keyName);
});

document.addEventListener("keyup", (event) => {
    const keyName = event.key;
    
    if (keyList[keyName] != undefined) {
        keyList[keyName] = false;
    }

    //console.log(keyName);
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