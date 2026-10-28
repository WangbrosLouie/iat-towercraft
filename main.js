console.log("this is like a println(); kinda");

//var lastFrameTime = time();

//setInterval(moveSquare, 1/60);

var playerX = 0;
var playerY = 0;

function moveSquare() {

	var player = document.getElementById("player");	

	var style = player.style;
	
	playerX++;
	playerY++;
	console.log(playerX);
	
	style.left = playerX + "px";
	style.top = playerY + "px";
	console.log(style.left);
	
}

/* to-do

	scan keypresses
	react to keypresses
	make a box element (temp player)
	make it move around with wasd or arrows
	
*/