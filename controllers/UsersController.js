/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    try {
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).send({ error: 'Already exist' });
      }
      const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });
      return res.status(201).send({ email, id: result.insertedId });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).send({ error: 'Already exist' });
      }
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });
      return res.status(200).send({ id: user._id, email: user.email });
    } catch (err) {
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
