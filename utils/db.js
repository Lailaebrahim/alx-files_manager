const mongodb = require('mongodb');

class DBClient {
  constructor() {
    this.db_host = process.env.DB_HOST || 'localhost';
    this.db_port = process.env.DB_PORT || 27017;
    this.db_database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${this.db_host}:${this.db_port}/${this.db_database}`;
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.db_database);
      console.log('MongoDB client connected to the server');
    } catch (error) {
      console.error(`MongoDB client not connected to the server: ${error}`);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = await this.db.collection('users').countDocuments({}, { hint: '_id_' });
    return users;
  }

  async nbFiles() {
    const files = await this.db.collection('files').countDocuments({}, { hint: '_id_' });
    return files;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
