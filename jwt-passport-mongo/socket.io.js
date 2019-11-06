const socketIO = require('socket.io')
const { Player, Players } = require('./utils/Players')
const { GameRooms } = require('./utils/GameRooms')

module.exports.listen = (server) => {
    // Create socket
    const io = socketIO.listen(server);
    const playerList = new Players();   // Player who is finding match
    const roomList = new GameRooms();

    // Handle connetion
    io.on('connection', socket => {
        console.log("New client connected!");
        var currentPlayer = null;

        socket.on('registerPlayer', playerId => {
            if (playerId !== null) {
                // Check if player existed
                if (playerList.checkExistedPlayer(playerId)) {
                    console.log('Old player re-connected!');
                    currentPlayer = playerList.updatePlayerState(playerId, false, socket.id);
                    if (currentPlayer.joined) {
                        let currentRoom = roomList.getRoomByPlayerId(playerId);
                        roomList.restartRoom(currentPlayer.id);
                        if (currentRoom === false) {
                            console.log("Cannot find rival now!");
                        }
                        else {
                            console.log("Create room success!");
                            let player1 = playerList.getPlayer(currentRoom.playerId1);
                            let player2 = playerList.getPlayer(currentRoom.playerId2);
                            io.to(player1.socketId).emit('foundRoom', {
                                id: currentRoom.id,
                                isFirst: true
                            });
                            io.to(player2.socketId).emit('foundRoom', {
                                id: currentRoom.id,
                                isFirst: false
                            });
                        }
                    }
                }
                else {
                    let newPlayer = new Player(playerId, socket.id);
                    currentPlayer = newPlayer;
                    playerList.addPlayer(newPlayer);
                }
                socket.emit('registerComplete');
                console.log('Register complete: ', currentPlayer);
            }
            else {
                console.log("This playerId is not correct!");
            }
        })

        // Handle find rival of player
        socket.on('findRival', playerId => {
            let newRoom = roomList.createRoom(playerList, playerId);
            if (newRoom === false) {
                console.log("Cannot find rival now!");
            }
            else {
                console.log("Create room success!");
                let player1 = playerList.getPlayer(newRoom.playerId1);
                let player2 = playerList.getPlayer(newRoom.playerId2);
                io.to(player1.socketId).emit('foundRoom', {
                    id: newRoom.id,
                    isFirst: true
                });
                io.to(player2.socketId).emit('foundRoom', {
                    id: newRoom.id,
                    isFirst: false
                });
            }
        })

        // Handle player join room
        socket.on('joinRoom', roomId => {
            if (roomId !== null && roomId !== undefined) {
                socket.emit('Welcome');
            }
        })

        // Player start a move
        socket.on('cNewMove', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                if (room.playerId1 === data.id) {
                    io.to(player2.socketId).emit('sNewMove', data);
                }
                else {
                    io.to(player1.socketId).emit('sNewMove', data);
                }
            }
        })

        // Handle undo request
        socket.on('undoRequest', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('undoRequest', data.userId);
                io.to(player2.socketId).emit('undoRequest', data.userId);
            }
        })

        // Handle undo accept
        socket.on('undoAccepted', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('undoAccepted', data.userId);
                io.to(player2.socketId).emit('undoAccepted', data.userId);
            }
        })

        // Handle undo refuse
        socket.on('undoRefused', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('undoRefused', data.userId);
                io.to(player2.socketId).emit('undoRefused', data.userId);
            }
        })

        // Handle redo request
        socket.on('redoRequest', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('redoRequest', data.userId);
                io.to(player2.socketId).emit('redoRequest', data.userId);
            }
        })

        // Handle redo accept
        socket.on('redoAccepted', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('redoAccepted', data.userId);
                io.to(player2.socketId).emit('redoAccepted', data.userId);
            }
        })

        // Handle redo refuse
        socket.on('redoRefused', data => {
            let room = roomList.getRoom(data.roomId);
            if (room !== null) {
                let player1 = playerList.getPlayer(room.playerId1);
                let player2 = playerList.getPlayer(room.playerId2);
                io.to(player1.socketId).emit('redoRefused', data.userId);
                io.to(player2.socketId).emit('redoRefused', data.userId);
            }
        })

        // disconnect when a client leaves the server
        socket.on('disconnect', () => {
            if (currentPlayer === null || currentPlayer === undefined) {
                console.log('Disconnect wihtout playing');
                console.log('Current player: ', currentPlayer);
                return;
            }
            console.log('User disconnected');
            currentPlayer.disconnectState = true;
            let disconnectedRoom = roomList.endRoom(currentPlayer.id);
            setTimeout(() => {
                if (currentPlayer.disconnectState) {
                    playerList.removePlayer(currentPlayer.id);
                    console.log("Remove player ", currentPlayer.id);
                }
                if (disconnectedRoom.endStatus) {
                    // Send endgame msg to both player
                    let player1 = playerList.getPlayer(disconnectedRoom.playerId1);
                    let player2 = playerList.getPlayer(disconnectedRoom.playerId2);
                    if (player1 !== null) io.to(player1.socketId).emit('cancel');
                    if (player2 !== null) io.to(player2.socketId).emit('cancel');
                    // Remove the room from array
                    roomList.removeEmptyRoom();
                    console.log("Remove room ", disconnectedRoom.id);
                }
                console.log(roomList);
                console.log(playerList);

            }, 5000);
        })
    })
}