const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

export default class UsersController{
    static postNew(req, res) {
        const { email, password } = req.body;
        if (!email) return res.status(400).send({ error: 'Missing email' });
        if (!password) return res.status(400).send({ error: 'Missing password' });
        dbClient.nbUsers().then((nbUsers) => {
            dbClient.db.collection('users').insertOne({ email, password }, (error, result) => {
                if (error) return res.status(400).send({ error: 'Already exist' });
                return res.status(201).send({ id: result.insertedId, email });
            });
        });
    }
}