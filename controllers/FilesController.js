import dbClient from '../utils/db';
import redisClient from '../utils/redis'
import { ObjectId } from 'mongodb';
import { uuid } from 'uuid';
import { promises as fsPromises } from 'fs';
import { createDirectory, convertFromBase64 } from '../utils/file';
import path from 'path';

export default class FilesController {
  static async postUpload(req, res) {
    try {

      // get user based on the token
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      // after user authorization validate data
      const { name, type, parentId, isPublic, data } = req.body;
      if (!name) return res.status(400).send({ error: 'Missing name' });
      if (!type || !(['folder', 'file', 'image'].includes(type))) return res.status(400).send({ error: 'Missing type' });
      if (type != "folder" && !data) return res.status(400).send({ error: 'Missing data' });
      if (parentId) {
        const parent = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parent) return res.status(400).send({ error: 'Parent not found' });
        if (parent.type != 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
      }

      // insert folder in DB
      if (type == "folder") {
        const folder = {
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic: isPublic || false,
        };
        const result = await dbClient.db.collection('files').insertOne(folder);
        return res.status(201).send({
          id: result.insertedId,
          userId: user._id,
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || 0
        });
      }

      // create directory if not exist
      const dirPath = path.join(__dirname, process.env.FOLDER_PATH || '/tmp/files_manager');
      await createDirectory(dirPath);

      // write file to disk
      const buff = convertFromBase64(data)
      const filePath = path.join(dirPath, uuid());
      await fsPromises.writeFile(filePath, buff);
      const file = {
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath: filePath
      };
      const result = await dbClient.db.collection('files').insertOne(file);
      return res.status(201).send({
        id: result.insertedId,
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0
      });
    } catch (Error){
      return res.status(500).send({ error: `Internal Server Error: ${Error}`});
    }
  }
}