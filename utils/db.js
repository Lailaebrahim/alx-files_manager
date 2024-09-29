const mongodb = require('mongodb');

class DBClient {
    constructor() {
        this.db_host = process.env.DB_HOST || 'localhost';
        this.db_port = process.env.DB_PORT || 27017;
        this.db_database = process.env.DB_DATABASE || 'files_manager';
        const dbURL = `mongodb://${this.db_host}:${this.db_port}/${this.db_database}`;
        this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
        this.client.on('error', (error) => { console.log(`Mongo client not connected to the server: ${error}`); });
        this.client.on('connect', () => { console.log('Mongo client connected to the server'); });
        this.client.connect();
    }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        const db = this.client.db(this.db_database);
        return db.collection('users').countDocuments();
    }

    async nbFiles() {
        const db = this.client.db(this.db_database);
        return db.collection('files').countDocuments();
    }

}

const dbClient = new DBClient();
module.exports = dbClient;