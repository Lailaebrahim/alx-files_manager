const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

export default class AppController {
  static getStatus(_req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    res.status(200).json({ redis, db });
  }

  static getStats(_req, res) {
    Promise.all([dbClient.nbUsers.countDocuments({}, { hint: "_id_" }), dbClient.nbFiles.countDocuments({}, { hint: "_id_" })])
      .then(([Users, nbFiles]) => {
        res.status(200).json({ users: Users, files: nbFiles });
      })
      .catch(() => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
}
