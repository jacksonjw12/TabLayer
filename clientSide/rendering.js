/*
List of variables available after initialize render file is called probs
var socket;
var c;
var ctx;
var player
var keys = []
var locations = []
var room = ""
var timestep = 20;
var speed = 5*timestep/10;
var gameDimmensions = [600,600]
var chatDimmensions = [400,600]
var tileData = []
var playerRadius = 40;
var tileSize = 100;
var mouseCoords = [gameDimmensions[0]/2,gameDimmensions[1]/2]
var tilePlacementMode = true;
var stars = undefined;
var animationState
var spriteSheet

*/
function render(){
	drawBackground();
	
    if(tilePlacementMode){
    	drawTileSpotlight();
    }

    adjustScreenCenter();
    
    
    //drawPlayer();
    drawSprite();
	
	drawTiles();

	
	drawOtherPlayers();
	//draw others
	
}


function initializeRenderFile(canvas, context, background){

}

function drawBackground(){
	ctx.fillStyle = "#FBFBFB";
	ctx.fillRect(0,0,1000,1000);
	
    ctx.drawImage(stars, player.screenCenter.x/5-tileSize/2, player.screenCenter.y/5-tileSize/2, gameDimmensions[0]/5, gameDimmensions[1]/5,0,0,gameDimmensions[0],gameDimmensions[1]);//the divided by's needs be the same or parallax stuff

}

function drawTiles(){
	if(tileData.length != 0){
		for(var j = 0; j<tileData.length; j++){
			ctx.fillStyle = "#" + tileData[j].id.toString();
			ctx.fillRect(gameDimmensions[0]/2-(player.screenCenter.x-tileSize*tileData[j].x)-tileSize/2,gameDimmensions[1]/2-(player.screenCenter.y-tileSize*tileData[j].y)-tileSize/2,tileSize,tileSize);
		}
	}
}
function drawPlayer(){
	ctx.fillStyle = "#" + player.id;
	ctx.beginPath();
	ctx.arc(gameDimmensions[0]/2-(player.screenCenter.x-player.position.x),gameDimmensions[1]/2-(player.screenCenter.y-player.position.y),playerRadius,0,2*Math.PI);
	ctx.fill();

	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(gameDimmensions[0]/2-(player.screenCenter.x-player.position.x),gameDimmensions[1]/2-(player.screenCenter.y-player.position.y));
	ctx.lineTo(gameDimmensions[0]/2-(player.screenCenter.x-player.position.x)+playerRadius*Math.cos(player.rotation),gameDimmensions[1]/2-(player.screenCenter.y-player.position.y)-playerRadius*Math.sin(player.rotation));
	ctx.stroke();
}


function drawSprite(){
	var swidth = 25;
	var sheight = 35;


	if(moving){
		if(animationState >=40){animationState = 0;}
		var column = 0;
		var row = 0;
		var rot = player.rotation*180/Math.PI
		col = 3-Math.floor(animationState/10)
		if(rot == 0){
			row = 2	
		}
		else if(rot == 45 || rot == 90 || rot == 135){
			row = 3
		}
		else if(rot == 180){
			row = 1
		}
		else{
			row = 0
		}
		var sx = 13 + 51*col
		var sy = 8 + 51*row

		ctx.drawImage(spriteSheet, sx,sy,swidth,sheight,gameDimmensions[0]/2-(player.screenCenter.x-player.position.x)-playerRadius,gameDimmensions[1]/2-(player.screenCenter.y-player.position.y) - playerRadius,80,80);
		animationState++;
	}
	else{

		var row = 0;
		var rot = player.rotation*180/Math.PI
		col = 0
		if(rot == 0){
			row = 2	
		}
		else if(rot == 45 || rot == 90 || rot == 135){
			row = 3
		}
		else if(rot == 180){
			row = 1
		}
		else{
			row = 0
		}
		var sx = 13 + 51*col
		var sy = 8 + 51*row
		animationState = 0;
		ctx.drawImage(spriteSheet, sx,sy,swidth,sheight,gameDimmensions[0]/2-(player.screenCenter.x-player.position.x)-playerRadius,gameDimmensions[1]/2-(player.screenCenter.y-player.position.y) - playerRadius,80,80);

	}
	


}


function drawOtherPlayers(){
	for(var i = 0; i< locations.length; i++){
		if(locations[i].id != player.id){

			ctx.fillStyle = "#" +locations[i].id
			ctx.beginPath();
			ctx.arc(locations[i].x-player.screenCenter.x+gameDimmensions[0]/2,locations[i].y-player.screenCenter.y+gameDimmensions[1]/2,playerRadius,0,2*Math.PI);
			ctx.fill();
		}
		
	}
}

function adjustScreenCenter(){
	if(player.screenCenter.x - player.position.x > 100 ){
    	
    	player.screenCenter.x -= speed
    }
    else if(player.screenCenter.x - player.position.x < -100 ){
    	
    	player.screenCenter.x += speed
    }
    if(player.screenCenter.y - player.position.y > 100 ){
    	
    	player.screenCenter.y-= speed
    }
    else if(player.screenCenter.y - player.position.y < -100 ){
    	player.screenCenter.y += speed

    }
}

function drawTileSpotlight(){
	ctx.save();
    	ctx.fillStyle = "#ADD8E6"
		ctx.globalAlpha = 0.4;
		ctx.beginPath();
		ctx.arc(gameDimmensions[0]/2-(player.screenCenter.x-player.position.x),gameDimmensions[1]/2-(player.screenCenter.y-player.position.y),300,0,2*Math.PI);
		ctx.fill();
		ctx.clip();
		var beginXPos = (Math.floor(player.screenCenter.x/tileSize)-10)*tileSize;
		var beginYPos = (Math.floor(player.screenCenter.y/tileSize)-10)*tileSize;
		var finalXPos = beginXPos + 20 * tileSize;
		var finalYPos = beginYPos + 20 * tileSize;

		for(var i = 0; i<20; i++){
			ctx.beginPath();
			ctx.moveTo((beginXPos+i*tileSize)-player.screenCenter.x-tileSize/2,beginYPos-player.screenCenter.y-tileSize/2);
			ctx.lineTo((beginXPos+i*tileSize)-player.screenCenter.x-tileSize/2,finalYPos-player.screenCenter.y-tileSize/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo((beginXPos+i*tileSize)-player.screenCenter.x-tileSize/2+1,beginYPos-player.screenCenter.y-tileSize/2);
			ctx.lineTo((beginXPos+i*tileSize)-player.screenCenter.x-tileSize/2+1,finalYPos-player.screenCenter.y-tileSize/2);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(beginXPos-player.screenCenter.x-tileSize/2,(beginYPos+i*tileSize)-player.screenCenter.y-tileSize/2);
			ctx.lineTo(finalXPos-player.screenCenter.x-tileSize/2,(beginYPos+i*tileSize)-player.screenCenter.y-tileSize/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(beginXPos-player.screenCenter.x-tileSize/2,(beginYPos+i*tileSize)-player.screenCenter.y-tileSize/2+1);
			ctx.lineTo(finalXPos-player.screenCenter.x-tileSize/2,(beginYPos+i*tileSize)-player.screenCenter.y-tileSize/2+1);
			ctx.stroke();


		}
		//var cursorXPos =  Math.floor((mouseCoords.x+tileSize/2)/tileSize)*tileSize
		//var cursorYPos =  (Math.floor((mouseCoords.y+tileSize/2)/tileSize)*tileSize)
		//(player.screenCenter.x-tileSize*tileData[j].x)-tileSize/2
		var cursorXPos =  player.screenCenter.x + ( mouseCoords.x-gameDimmensions[0]/2) + tileSize/2
		var cursorYPos =  player.screenCenter.y + ( mouseCoords.y-gameDimmensions[1]/2) + tileSize/2
		var cursortileX = Math.floor(cursorXPos/tileSize)
		var cursortileY = Math.floor(cursorYPos/tileSize)
		var cursorScreenX = gameDimmensions[0]/2-(player.screenCenter.x-tileSize*cursortileX)-tileSize/2
		var cursorScreenY = gameDimmensions[1]/2-(player.screenCenter.y-tileSize*cursortileY)-tileSize/2
		ctx.fillRect(cursorScreenX,cursorScreenY,tileSize,tileSize);

		activetile = {"x":cursortileX, "y":cursortileY}

		//ctx.fillRect(cursorXPos,cursorYPos,tileSize,tileSize)



		ctx.restore();
}

function tileCoordToScreenCoord(tileX,tileY){
	return {"x":gameDimmensions[0]/2-(player.screenCenter.x-tileSize*tileX)-tileSize/2,
			"y":gameDimmensions[1]/2-(player.screenCenter.y-tileSize*tileY)-tileSize/2}

}

function mapCoordToCanvasCoord(coord, playerReference){//todo, change to this get some standard way to do that
	return coord - playerReference - tileSize/2;
}






