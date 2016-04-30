var io
//var locations = {    {"room1":[ {"name":"AAAABB","x":100,"y":100}, {"name":"BABCDC","x":200,"y":100}]}    }

//playerexample = {"Socket":socket, "Location":{"x":42,"y",24}, "Rotation":90, "IGN":"Richard Wang", GameRoom:bestgame}
//gameroom example = {"name":abcd, }
var worldExample = {
	"name":"room1",
	"players":[
	{
		"id":"000022",
		"socket":123,
		"ign":"jack"
	},
	{
		"id":"FF5555",
		"socket":1235,
		"ign":"jill"
	}

	],
	"tileData":[{"id":0,"x":5,"y":5},{"id":1,"x":6,"y":5},{"id":0,"x":7,"y":5}],//instead of 2d array i will try a tile object system

	"playerData":[]

}

var worlds = [{
	"name":"room1",
	"players":[
	{
		"id":"000022",
		"socket":123,
		"ign":"jack"
	},
	{
		"id":"FF5555",
		"socket":1235,
		"ign":"jill"
	}

	],
	"tileData":[{"id":999955,"x":3,"y":5,"z":0},{"id":990022,"x":6,"y":5,"z":0},{"id":110090,"x":10,"y":5,"z":0}],//instead of 2d array i will try a tile object system

	"playerData":[ {"id":"000022","x":400,"y":500}, {"id":"FF5555","x":300,"y":400}]

}];

var connectedPlayers = [
	{
		"name":"jack",
		"room":"room1",
		"socket":123,
		"id":"000022"

	},
	{
		"name":"jill",
		"room":"room1",
		"socket":1235,
		"id":"FF5555"

	}


]


function test(req, res){
	console.log("eyy lmao")
	res.send("hey");
}

function initializeSockets(server){
	io = require('socket.io')(server);
	io.on('connection', function (socket) {
		
			
		socket.emit('requestNames', {});
			
		socket.on('requestRooms', function (data){
			var rooms = ""
			for(var i = 0; i< worlds.length; i++){
				rooms += worlds[i].name
			}
			socket.emit('listRooms', {"rooms":rooms})
		});

		socket.on('disconnect', function (data){
			for(playerIterator in connectedPlayers){
				player = connectedPlayers[playerIterator];
				if(player.socket == socket){
					var disconnectedPlayerRoom = player.room;
					var disconnectedPlayerId = player.id;
					io.to(player.room).emit('receivedMessage', {"message":player.name + " has disconnected", "ign":player.room,"id":player.id})
					connectedPlayers.splice(playerIterator,1)
					for(worldIterator in worlds){
						world = worlds[worldIterator]
						if(world.name == disconnectedPlayerRoom){
							
							for(var playerIterator2 in world.playerData){
								var player = world.playerData[playerIterator2];
								if(player.id == disconnectedPlayerId){
									world.playerData.splice(playerIterator2, 1)
								}
							}

							for(var playerIterator2 in world.players){
								var player = world.players[playerIterator2];
								if(player.id == disconnectedPlayerId){
									world.players.splice(playerIterator2, 1)
								}
							}


						}
					}


				}
			}



			console.log("disconnected");
			
		});
		socket.on('sendMessage', function(data){
			console.log("----" + data.message + "---")
			io.to(data.roomName).emit('receivedMessage', data)
		});
		socket.on('returnNames', function (data){//This is what is called when aplayer fully joins a room for good
			socket.join(data.roomName)
			io.to(data.roomName).emit('receivedMessage', {"message":data.playerName + " has connected", "ign":data.roomName,"id":data.id})
			newRoom = true;
			for(worldIterator in worlds){
				world = worlds[worldIterator]
				if(world.name == data.roomName){
					world.players.push({"id":data.id, "socket":socket, "ign":data.playerName})
					socket.emit('newTileData', {"numberOf":"multiple", "tiles":world.tileData})
					console.log("gave tile data----------------------------------------------")
					newRoom = false;

				}
			}
			if(newRoom){
				worldExample.name = data.roomName
				worldExample.players = [{"id":data.id, "socket":socket, "ign":data.playerName}]
				worldExample.playerData = []
				worlds.push(worldExample)
				console.log("new room")
			}
			connectedPlayers.push({"socket":socket,"name":data.playerName,"room":data.roomName,"id":data.id})


			socket.emit('roomConnection', {})
			
		});

		socket.on('myLocation', function (data) {
			//data = {roomName, id, x,y}

			for(worldIterator in worlds){
				world = worlds[worldIterator]

				if(world.name == data.roomName){
					var newPlayer = true
					for(playerIterator in world.playerData){
						player = world.playerData[playerIterator]
						if(player.id == data.id){


							newPlayer = false
							player.x = data.x
							player.y = data.y
						}
					}
					if(newPlayer){
						console.log("new Player")
						if(world.playerData)
						world.playerData.push({"id":data.id,"x":data.x,"y":data.y})
						console.log("added a new player : " + data.id)
						
						console.log("hi dude")
						console.log(world)

					}
					io.to(data.roomName).emit('locations',{"locations":world.playerData})
					

					
				}
				
			}

		});
		socket.on('addedTile', function (data){

			for(worldIterator in worlds){
				world = worlds[worldIterator]
				
				if(world.name == data.roomName){
					var newTile = true;
					for(var i = 0; i<world.tileData.length; i++){
						if(data.tile.x == world.tileData[i].x && data.tile.y == world.tileData[i].y && data.tile.z == world.tileData[i].z){
							world.tileData[i].id = data.tile.id;
							newTile = false;
						}
					}
					if(newTile){
						world.tileData.push(data.tile)
					}
					io.to(data.roomName).emit('newTileData', {"numberOf":"single", "tile":data.tile})

				}
				
			}



		});

		
		
	});



}

function listRooms(req, res){
	var rooms = []
	for(w in worlds){
		world = worlds[w]
		rooms.push({"name":world.name,"players":world.players.length})
	}
	res.send({"roomList":rooms});
}


var exports;
exports.test = test;
exports.listRooms = listRooms;
exports.initializeSockets = initializeSockets;