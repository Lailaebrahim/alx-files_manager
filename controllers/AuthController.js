import crypto from 'crypto';
import dbClient from '../utils/db';
const redisClient = require('../utils/redis');
const { uuidv4 } = require('uuid');

export default class AuthController {
    static getConnect(req, res) {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Basic ')) return res.status(401).send({ error: "Unauthorized" });
        const authorization_header = auth.split(' ')[1];
        if (authorization_header.length !== 2) return res.status(401).send({ error: "Unauthorized" });
        const authorization_header_Str = Buffer.from(authorization_header, 'base64').toString('utf-8');
        const [email, password] = authorization_header_Str.split(':');
        if (!email || !password) return res.status(401).send({ error: "Unauthorized" });
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        dbClient.db.collection('users').findOne({ email, password: hashedPassword }, (error, user) => {
            if (error || !user) return res.status(401).send({ error: "Unauthorized" });
            const token = uuidv4();
            redisClient.set(`auth_${token}`, user._id.toString(), 86400);
            return res.status(200).send({ token });
        });
    }
}