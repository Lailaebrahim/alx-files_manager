const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

export default class AppController {
  static getStatus(_req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    res.status(200).json({ redis, db });
  }

  static getStats(_req, res) {
    const users = dbClient.db.collection('users');
    const files = dbClient.db.collection('files');
    Promise.all([users.countDocuments({}, { hint: '_id_' }), files.countDocuments({}, { hint: '_id_' })])
      .then(([Users, Files]) => {
        res.status(200).json({ users: Users, files: Files });
      })
      .catch(() => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
}
