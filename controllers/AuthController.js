/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return res.status(401).send({ error: 'Unauthorized' });
    const authHeader = auth.split(' ')[1];
    const authHeaderStr = Buffer.from(authHeader, 'base64').toString('utf-8');
    const [email, password] = authHeaderStr.split(':');
    if (!email || !password) return res.status(401).send({ error: 'Unauthorized' });
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    try {
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });
      const token = uuidv4();
      const response = await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      if (!response) return res.status(500).send({ error: 'Internal Server Error' });
      return res.status(200).send({ token });
    } catch (error) {
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).send({ error: 'Unauthorized' });
    try {
      const response = await redisClient.del(`auth_${token}`);
      if (response === 1) return res.status(204).send();
      return res.status(401).send({ error: 'Unauthorized' });
    } catch (error) {
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
