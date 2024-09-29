import crypto from 'crypto';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = { email, password: hashedPassword };

    try {
      // check if the email already exists
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).send({ error: 'Already exist' });
      }

      // insert the new user
      const result = await dbClient.db.collection('users').insertOne(user);
      return res.status(201).send({ email, id: result.insertedId });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).send({ error: 'Already exist' });
      }
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  static getMe(req, res) {
    const { userId } = req;
    dbClient.db.collection('users').findOne({ _id: userId }, (error, user) => {
      if (error || !user) return res.status(404).send({ error: 'User not found' });
      delete user.password;
      return res.status(200).send(user);
    });
  }
}
