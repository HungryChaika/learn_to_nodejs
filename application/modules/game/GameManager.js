const Module = require('../Module');
const Game = require('./game/Game'); // конструктор арены

class GameManager extends Module {
    constructor(options) {
        super(options);

        this.games = [
            new Game({ 
                callbacks: { updateCb: (gameData) => {} },
                db: this.db,
                name: 'firstGame'
            }),
            new Game({ 
                callbacks: { updateCb: (gameData) => {} },
                db: this.db,
                name: 'secondGame'
            }),
            new Game({ 
                callbacks: { updateCb: (gameData) => {} },
                db: this.db,
                name: 'thirdGame'
            }),
            //new Game({ callbacks: { updateCb: (gameData) => {}} })
        ];

        this.io.on('connection', socket => {
            socket.on(this.MESSAGES.MOVE, (data) => this.moveGamer(data));
            socket.on(this.MESSAGES.STOP_MOVE, () => this.stopMove(socket));
            socket.on(this.MESSAGES.CHANGE_DIRECTION, (data) => this.changeDireciton(data));
            socket.on(this.MESSAGES.GET_GAMES, () => this.getGames(socket));
            socket.on(this.MESSAGES.JOIN_GAME, (data) => this.joinGame(data, socket));
            socket.on(this.MESSAGES.LEAVE_GAME, (data) => this.leaveGame(data, socket));
        });
    }

    getGames(socket) {
        const games = [];
        this.games.forEach((game) => { games.push(game.getData()); });
        socket.emit(this.MESSAGES.GET_GAMES, games);
    }

    joinGame(data, socket) {
        const { gameName, token } = data;
        const scene = this.games.find((game) => game.name === gameName).joinGame(token);
        scene ? 
            socket.emit(this.MESSAGES.JOIN_GAME, { result: true, gameName, scene }) :
            socket.emit(this.MESSAGES.JOIN_GAME, { result: false });

    }

    leaveGame({ gameName, token }, socket) {
        const game = this.games.find((game) => game.name === gameName);
        if (game) {
            const result = game.leaveGame(token);
            socket.emit(this.MESSAGES.LEAVE_GAME, { result });
        }
    }

    moveGamer({ gameName, direction, token }) {
        if (gameName && direction && token) {
            const game = this.games.find((game) => game.name === gameName);
            if (game) {
                game.moveGamer(direction, token);
            }
        }
    }

    stopMove(socketId) {

    }

    changeDireciton({ x, y }) {
        
    }

    getScene() {

    }
}

module.exports = GameManager;