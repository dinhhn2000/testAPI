class Players {
    constructor() {
        this.players = [];
    }
    addPlayer(newPlayer) {
        this.players.push(newPlayer);
    }
    getPlayer(playerId) {
        if (this.players.length > 0) {
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].id === playerId)
                    return this.players[i];
            }
            return null;
        }
        return null;
    }
    removePlayer(playerId) {
        if (this.players.length > 0)
            this.players = this.players.filter(player => player.id !== playerId);
    }
    updatePlayerState(playerId, playerState, socketId) {
        // console.log(this.players);
        // console.log('PlayerId: ', playerId);
        // console.log('SocketId: ', socketId);

        if (this.players.length > 0)
            this.players.map(player => {
                if (player.id === playerId) {
                    player.disconnectState = playerState;
                    player.socketId = socketId;
                    // console.log(this.players);
                    return player;
                }
            });
        for (let i = 0; i < this.players.length; i++)
            if (this.players[i].id === playerId) {
                this.players[i].disconnectState = playerState;
                this.players[i].socketId = socketId;
                return this.players[i];
            }

        console.log('Cannot find player in list');
        return null;
    }
    checkExistedPlayer(playerId) {
        for (let i = 0; i < this.players.length; i++)
            if (this.players[i].id === playerId)
                return true;
        return false;
    }
    playerJoinRoom(playerId) {
        if (this.players.length > 0)
            // Not need to set this.player because the element is
            // in another class so is affect on this.players
            this.players.map(player => {
                if (player.id === playerId) {
                    player.joined = true;
                    // console.log('Found player', this.players);
                }
            });
    }
    playerLeaveRoom(playerId) {
        if (this.players.length > 0)
            // Not need to set this.player because the element is
            // in another class so is affect on this.players
            this.players.map(player => {
                if (player.id === playerId) {
                    player.joined = true;
                }
            });
    }
    getFreePlayer() {
        return this.players.filter(player => (player.joined === false && player.disconnectState === false));
    }
}

class Player {
    constructor(id, socketId) {
        this.id = id;
        this.socketId = socketId;
        this.disconnectState = false;
        this.joined = false;
    }
}

module.exports = { Players, Player };