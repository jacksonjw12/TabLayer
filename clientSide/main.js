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
var mouseCoords = {"x":gameDimmensions[0]/2,"y":gameDimmensions[1]/2}
var tilePlacementMode = true;
var stars = undefined;
var activetile = {}
var spriteSheet = undefined;
var moving = false;
var animationState = 0;

function getRooms(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			rooms = JSON.parse(xmlHttp.responseText).roomList;
			var string = "<h3 style='margin-bottom:0px;''>Current Rooms</h3><table style='text-align:center;'><tr><th>Name</th><th># Players</th></tr>" 
			for(r in rooms){
				room = rooms[r]
				string += "<tr><td>" + room.name + "</td><td>" + room.players + "</td></tr>" 

			}

			document.getElementById('rooms').innerHTML = string
		}

		}
	xmlHttp.open("GET", "listRooms", true); // true for asynchronous 
	xmlHttp.send({});



}

getRooms();
function connect(){
	roomName = document.getElementById("roomName").value;
	playerName = document.getElementById("playerName").value;
	
	if(roomName != ""){
		
		room = roomName
		document.getElementById("canvasHolder").innerHTML =
		 '<canvas id="myCanvas" width="' + gameDimmensions[0] + 'px" height="' + gameDimmensions[1] +'px" style="border:1px solid #ababab;float:left;"></canvas>' + 
		 '<div id="chatContainer" style="padding-bottom:7px;display: inline-block;height:' + chatDimmensions[1] + 'px;width:'+chatDimmensions[0]+'px;border:1px solid #ababab;">' + 
		 '<div style="overflow-y:scroll;height:'+(chatDimmensions[1]-30)+'px;" id="chat"></div><br><form action="javascript:sendMessage()"><input type="text" style="width:80%;" id="chatTextBox"><input style="width:20%;" type="submit" id="chatBoxSubmit"></form></div>';
		createPlayer(playerName)
		
		socket = io();

		socket.on('requestNames', function (data){
			socket.emit('returnNames', {"playerName":player.ign,"id":player.id,"roomName":roomName})
			
		});
		socket.on('roomConnection', function(data){
			main();
			console.log("here we go")
		});

		socket.on('locations', function (data) {
			locations = data.locations

		});

		socket.on('receivedMessage', receivedMessage)
		socket.on('newTileData', receiveTileData)
		
	}

	

}

function main(){
	document.onkeydown = keyDown;
	document.onkeyup = keyUp
	

	stars = new Image();
	stars.src = 'stars.gif';

	spriteSheet = new Image();
	spriteSheet.src = 'spriteSheet.png';

	c = document.getElementById("myCanvas");

	c.addEventListener('mousemove',mouseMove, false);

	c.addEventListener('click', mouseClick, false);

	ctx = c.getContext("2d");

	initializeRenderFile(c, ctx, stars)//canvas context bg

	ctx.fillStyle = "#6AACAC";
	ctx.fillRect(0,0,gameDimmensions[0],gameDimmensions[1]);

	

	ctx.beginPath();
	ctx.arc(player.position.x,player.position.y,playerRadius,0,2*Math.PI);
	ctx.stroke();

	console.log("hey there!")
	
	step()

}

function step(){
	physics()
	//this^ is where we will send our state to the server
	render()
	

	setTimeout(step, timestep)
}

function physics(){
	
	if(document.activeElement == document.body){
		var xDelta = 0;
		var yDelta = 0;
		var prevX = player.position.x
		var prevY = player.position.y
		moving = false;
		if(keys.indexOf(67) != -1){
			tilePlacementMode = !tilePlacementMode
		}

		if(keys.indexOf(87) != -1){
			player.position.y-=speed;
			yDelta++;
			moving = true;
		}
		if(keys.indexOf(83) != -1){
			player.position.y+=speed;
			yDelta--;
			moving = true;
		}
		if(keys.indexOf(65) != -1){
			player.position.x-=speed;
			xDelta--;
			moving = true;

		}
		if(keys.indexOf(68) != -1){
			player.position.x+=speed;
			xDelta++;
			moving = true;

		}
		if(keys.indexOf(66) != -1){
			createTile(101099)
		}
		if(xDelta != 0 || yDelta != 0){
			var angle = 0;
			if(xDelta > 0){
				angle = Math.atan(yDelta/xDelta)
			}
			else if(xDelta<0 && yDelta>=0){
				angle = Math.PI + Math.atan(yDelta/xDelta)
			}
			else if(xDelta<0 && yDelta<0){
				angle = -Math.PI + Math.atan(yDelta/xDelta)
			}
			else if(yDelta>0 && xDelta==0){
				angle = Math.PI/2
			}
			else if(yDelta<0 && xDelta==0){
				angle = -Math.PI/2
			}
			if(angle < 0){
				angle+=Math.PI*2
			}

			player.rotation = angle
		}

		//collision time :) todo, make sure a player cant put a tile ontop of a player, or that once they do, that player is either immune or gets booted out of the way
		//player.position.x player.position.y
		for(var i = 0; i<tileData.length; i++){
			var tile = tileData[i]
			tileSize = tileSize
			var tileX = tile.x*tileSize
			var tileY = tile.y*tileSize
			var distance = playerRadius+tileSize/2
			if(Math.abs(tileX-player.position.x) < distance && Math.abs(tileY-player.position.y) < distance){
				if(xDelta != 0 && Math.abs(tileX-player.position.x) < distance && Math.abs(tileY-prevY) < distance){
					if(xDelta > 0){
						player.position.x = tileX-distance-1
						
					}
					else{
						player.position.x = tileX+distance+1
						
					}
				}


				if(yDelta != 0 && Math.abs(tileX-prevX) < distance && Math.abs(tileY-player.position.y) < distance){
					if(yDelta > 0){
						player.position.y = tileY+distance+1
					}
					else{
						player.position.y = tileY-distance-1
					}
				}
				

			}
			
			
			

		}


		reportPosition()
	}
	
}

function reportPosition(){
	socket.emit('myLocation', {"roomName": room, "x":player.position.x, "y":player.position.y, "id":player.id});
}

function mouseMove(evt) {
	mouseCoords = getMousePos(c, evt);
	//console.log('Mouse position: ' + mouseCoords.x + ',' + mouseCoords.y);
	
}
function mouseClick(evt){
	//console.log('Mouse position on click: ' + mouseCoords.x + ',' + mouseCoords.y);
	if(tilePlacementMode){
		if(inTileForClick()){
			createTile(990011, activetile.x, activetile.y)
		}

		
	}

}
function inTileForClick(){
	var tileX = activetile.x * tileSize
	var tileY = activetile.y * tileSize 
	

	tileSize = tileSize
	
	var distance = playerRadius+tileSize/2
	if(Math.abs(tileX-player.position.x) < distance && Math.abs(tileY-player.position.y) < distance){
		if(Math.abs(tileX-player.position.x) < distance || Math.abs(tileY-player.position.y) < distance){
			return false;
		}
		

	}

	
	return true;

}

function keyDown(e){
	badKeys = [13,183]//i dont like 183, (actually maybe this will create an error someday lol sorry me)
	value = e.keyCode
	if(keys.indexOf(value) == -1 && badKeys.indexOf(value) == -1){
		keys.push(value)
	}
	if(value == 13){
		if(document.activeElement == document.body){
			document.getElementById("chatTextBox").focus()
		}
		else if(document.getElementById("chatTextBox").value == "" || typeof document.getElementById("chatTextBox").value != "string"){
			document.getElementById("chatTextBox").blur()
		}
		else{
			sendMessage();
			console.log('ey')
		}
	}
}
function keyUp(e){
	value = e.keyCode

	for(var i = keys.length; i--;) {
		if(keys[i] === value) {
			keys.splice(i, 1);
		}
	} 
  
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function makeId()
{
    var text = "";
    var possible = "ABCDE0123456789";//no f becayse i dont want any tots white

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function createPlayer(name){
	player = {};
	player.position = {};
	player.position.x = gameDimmensions[0]/2;
	player.position.y = gameDimmensions[1]/2;
	player.id = makeId()
	player.ign = name
	player.screenCenter = {}
	player.screenCenter.x = player.position.x
	player.screenCenter.y = player.position.y
	player.rotation = 0;

}
function sendMessage(){
	console.log("wasup")
	var message = document.getElementById("chatTextBox").value;
	if(message != "" && typeof message == "string"){
		console.log("dude")
		socket.emit('sendMessage', {"message":message,"roomName":room,"ign":player.ign,"id":player.id})
		document.getElementById("chatTextBox").value = "";
	}
	
}	

function createTile(tileID, x, y){
	//rn physics will call this
	
	socket.emit('addedTile', {"tile":{"id":tileID,"x":x,"y":y,"z":0},"roomName":room})



}

function receivedMessage(data){
	document.getElementById("chat").innerHTML+= '<u style="color:#' + data.id + '">' + data.ign + '</u>' + ' : ' + data.message + '</br>';
	var objDiv = document.getElementById("chat");
	objDiv.scrollTop = objDiv.scrollHeight;
}
function receiveTileData(data){
	if(data.numberOf == "multiple"){//i think the only reason multiple would be listed is for new players, so we will assums that nothins in plr array and just overwrite
		tileData = data.tiles;
		console.log("received some tiles")
	}
	else{
		var newTile = true;
		for(var i = 0; i<tileData.length; i++){
			if(data.tile.x == tileData[i].x && data.tile.y == tileData[i].y && data.tile.z == tileData[i].z){
				tileData[i].id = data.tile.id;
				newTile = false;
			}
		}
		if(newTile){
			tileData.push(data.tile)
		}
	}
	
}





