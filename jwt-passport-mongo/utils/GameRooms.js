class Match {
    constructor(playerIdA, playerIdB) {
        this.id = playerIdA + '_' + playerIdB;
        this.endStatus = false;
        this.playerId1 = playerIdA;
        this.playerId2 = playerIdB;
    }
}

class GameRooms {
    constructor() {
        this.rooms = [];
    }
    createRoom(playerList, playerId) {
        // get players array
        let players = playerList.players;

        // Match 2 players
        let freePlayers = playerList.getFreePlayer();
        if (freePlayers.length > 1) {
            for (let i = 0; i < freePlayers.length; i++) {
                if (freePlayers[i].id !== playerId) {
                    const newMatch = new Match(playerId, freePlayers[i].id);
                    this.rooms.push(newMatch);
                    playerList.playerJoinRoom(freePlayers[i].id);
                    playerList.playerJoinRoom(playerId);
                    return newMatch;
                }
            }
        }
        else
            return false;
    }
    getRoom(roomId) {
        for (let i = 0; i < this.rooms.length; i++)
            if (this.rooms[i].id === roomId)
                return this.rooms[i];
        return null;
    }
    getRoomByPlayerId(playerId) {
        for (let i = 0; i < this.rooms.length; i++)
            if (this.rooms[i].id.includes(playerId))
                return this.rooms[i];
        return null;
    }
    restartRoom(playerId){
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id.includes(playerId)) {
                this.rooms[i].endStatus = false;
                return true;
            }
        }
        return false;
    }
    endRoom(playerId) {
        for (let i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id.includes(playerId)) {
                this.rooms[i].endStatus = true;
                console.log(`The room ${this.rooms[i].id} has been ended!`);
                return this.rooms[i];
            }
        }
        return false;
    }
    removeEmptyRoom() {
        this.rooms = this.rooms.filter(room => room.endStatus === false);
    }
}

module.exports = { Match, GameRooms };
