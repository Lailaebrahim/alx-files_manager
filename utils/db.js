const mongoose = require('mongoose');

class DBClient {
    constructor() {
        this.db_host = process.env.DB_HOST || 'localhost';
        this.db_port = process.env.DB_PORT || 27017;
        this.db_database = process.env.DB_DATABASE || 'files_manager';
        this.client = mongoose.client();
    }

    isAlive() {
        return this.client.connected;
    }

    async nbUsers() {
        return new Promise((resolve, reject) => {
            this.client.countDocuments('users', (err, users) => {
                if (err) reject(err);
                resolve(users);
            });
        });
    }

    async nbFiles() {
        return new Promise((resolve, reject) => {
            this.client.countDocuments('files', (err, files) => {
                if (err) reject(err);
                resolve(files);
            });
        });
    }

}

const dbClient = DBClient();
module.exports = dbClient;