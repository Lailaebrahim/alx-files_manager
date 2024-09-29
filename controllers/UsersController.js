import crypto from 'crypto';
import dbClient from '../utils/db.js';


export default class UsersController{
    static postNew(req, res) {
        const { email, password } = req.body;
        if (!email) return res.status(400).send({ error: 'Missing email' });
        if (!password) return res.status(400).send({ error: 'Missing password' });
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        dbClient.db.collection('users').insertOne({ email, password: hashedPassword }, (error, result) => {
            if (error) return res.status(400).send({ error: 'Already exist' });
            return res.status(201).send({ email, password: hashedPassword });
        });
    }
}