import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return res.status(401).send({ error: 'Unauthorized' });
    const authHeader = auth.split(' ')[1];
    const authHeaderStr = Buffer.from(authHeader, 'base64').toString('utf-8');
    const [email, password] = authHeaderStr.split(':');
    if (!email || !password) return res.status(401).send({ error: 'Unauthorized' });
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    dbClient.db.collection('users').findOne({ email, password: hashedPassword }, (error, user) => {
      if (error || !user) return res.status(401).send({ error: 'Unauthorized' });
      const token = uuidv4();
      redisClient.set(`auth_${token}`, user._id.toString(), 86400);
      return res.status(200).send({ token });
    });
  }

  static getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });
    redisClient.del(`auth_${token}`, (_error, response) => {
      if (response === 1) return res.status(204).send();
      return res.status(401).send({ error: 'Unauthorized' });
    });
  }
}
