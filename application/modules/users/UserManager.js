const Module = require('../Module');
const User = require('./User');

class UserManager extends Module {

    constructor(options) {
        super(options);
        // обработчик соединения для КАЖДОГО клиента
        this.io.on('connect', (socket) => console.log(`${socket.id} connected`));
        this.io.on('connection', socket => {
            socket.on(this.MESSAGES.LOGIN, data => this.login(data, socket));
            socket.on(this.MESSAGES.REGISTRATION, data => this.registration(data, socket));
            socket.on(this.MESSAGES.LOGOUT, token => this.logout(token, socket));

            socket.on('disconnect', () => {
                // удаляем юзера, если он отключился, но не сделал логаут
                for (let id in this.users) {
                    if (this.users[id].socketId === socket.id) {
                        delete this.users[id];
                        break;
                    }
                }
                console.log(`${socket.id} disconnected!`);
            });
        });

        this.users = {};
        this.rooms = this.mediator.get(this.TRIGGERS.GET_ALL_ROOMS);
        this.mediator.set(this.TRIGGERS.GET_ALL_USERS, () => this.users);
    }

    async login(data, socket) {
        const user = new User({ db: this.db, socketId: socket.id });
        if (await user.auth(data) && !this.users[user.id]) {
            this.users[user.id] = user;
            socket.emit(this.MESSAGES.LOGIN, user.self().token);
            return true;
        }
        socket.emit(this.MESSAGES.LOGIN, false);
        return false;
    }
    
    async registration(data, socket) {
        const user = new User(this.db);
        if (await user.registration(data)) {
            this.users[user.id] = user;
            socket.emit(this.MESSAGES.REGISTRATION, user.self().token);
            return true;;
        }
        return false;
    }

    async logout(token, socket) {
        const userData = await this.db.getUserByToken(token);
        const user = this.users[userData.id];
        if (await user.logout(token)) {
            delete this.users[userData.id];
            socket.emit(this.MESSAGES.LOGOUT, true);
            return;
        }
        socket.emit(this.MESSAGES.LOGOUT, false);
    }

    async getAllUsers() {
        const users = await this.db.getAllUsers();
        return users;
    }
}

module.exports = UserManager;