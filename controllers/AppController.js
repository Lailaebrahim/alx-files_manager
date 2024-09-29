const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

export default class AppController {
    static getStatus(){
        const redis = redisClient.isAlive();
        const db = dbClient.isAlive();
        return { "redis": redis, "db": db };
    }

    static getStats(req, res) {
        Promise.all([dbClient.nbUsers, dbClient.nbFiles])
            .then(([Users, nbFiles]) => {
                res.status(200).json({ users: Users, files: nbFiles });
            });
    }
}