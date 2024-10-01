/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { createDirectory, convertFromBase64 } from '../utils/file';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { contentType } from 'mime-types';


const fileQueue = new Queue('thumbnail generation');

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
      const {
        name, type, parentId, isPublic, data,
      } = req.body;
      if (!name) return res.status(400).send({ error: 'Missing name' });
      if (!type || !(['folder', 'file', 'image'].includes(type))) return res.status(400).send({ error: 'Missing type' });
      if (type !== 'folder' && !data) return res.status(400).send({ error: 'Missing data' });
      if (parentId) {
        const parent = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parent) return res.status(400).send({ error: 'Parent not found' });
        if (parent.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
      }

      // insert folder in DB
      if (type === 'folder') {
        const folder = {
          userId: user._id,
          name,
          type,
          parentId: parentId || "0",
          isPublic: isPublic || false,
        };
        const result = await dbClient.db.collection('files').insertOne(folder);
        return res.status(201).send({
          id: result.insertedId,
          userId: user._id,
          name,
          type,
          isPublic: isPublic || false,
          parentId: parentId || 0,
        });
      }

      // create directory if not exist
      const dirPath = path.join(tmpdir(), process.env.FOLDER_PATH || '/files_manager');
      await createDirectory(dirPath);

      // write file to disk
      const buff = convertFromBase64(data);
      const filePath = path.join(dirPath, uuidv4());
      await fsPromises.writeFile(filePath, buff);
      const file = {
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || '0',
        localPath: filePath,
      };
      const result = await dbClient.db.collection('files').insertOne(file);
      if (file.type === "image") {
        const jobName = `Image thumbnail [${userId}-${fileId}]`;
        fileQueue.add({ userId, fileId, name: jobName });
      }
      return res.status(201).send({
        id: result.insertedId,
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || '0',
      });
    } catch (Error) {
      return res.status(500).send({ error: `Internal Server Error: ${Error}` });
    }
  }

  static async getShow(req, res) {
    try {
      // get user based on the token
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      // get file based on the file id and user id
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user._id) });
      if (!file) return res.status(404).send({ error: 'Not found' });
      return res.status(200).send({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (Error) {
      return res.status(404).send({ error: 'Not found' });
    }
  }

  static async getIndex(req, res) {
    try {
      // get user based on the token
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      // get files based on the user id
      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page, 10) || 0;
      
      const aggregationPipeline = [
        {
          $match: {
            userId: ObjectId(userId),
            parentId,
          },
        },
        { $sort: { _id: -1 } },
        { $skip: page * 20 },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            userId: 1,
            name: 1,
            type: 1,
            isPublic: 1,
            parentId: 1,
          },
        },
      ];
      
      const files = await dbClient.db.collection('files')
        .aggregate(aggregationPipeline)
        .toArray();
        
      return res.status(200).send(files);
    } catch (Error) {
      return res.status(500).send({ error: `Internal Server Error: ${Error}` });
    }
  }

  static async putPublish(req, res) {
    try {
      // get user based on the token
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      // get file based on the file id and user id
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user._id) });
      if (!file) return res.status(404).send({ error: 'Not found' });

      // update file to be public
      await dbClient.db.collection('files').updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });
      return res.status(200).send({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
      });
    }
    catch (Error) {
      return res.status(500).send({ error: `Internal Server Error: ${Error}` });
    }
  }

  static async putUnpublish(req, res) {
    try {
      // get user based on the token
      const token = req.header('X-Token');
      if (!token) return res.status(401).send({ error: 'Unauthorized' });
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).send({ error: 'Unauthorized' });
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      // get file based on the file id and user id
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user._id) });
      if (!file) return res.status(404).send({ error: 'Not found' });

      // update file to be private
      await dbClient.db.collection('files').updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });
      return res.status(200).send({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
      });
    } catch (Error) {
      return res.status(500).send({ error: `Internal Server Error: ${Error}` });
    }
  }

  static async getFile(req, res) {
    try {
      const fileId = req.params.id;
      const size = req.query.size || null;

      // Verify file existence
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
      if (!file) return res.status(404).send({ error: 'Not found' });

      // Check if the file is a folder
      if (file.type === "folder") {
        return res.status(400).send({ error: "A folder doesn't have content" });
      }

      // Determine if user has access to the file
      if (!file.isPublic) {
        const token = req.header('X-Token');
        if (!token) return res.status(404).send({ error: 'Not found' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(404).send({ error: 'Not found' });

        const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
        if (!user || file.userId.toString() !== user._id.toString()) {
          return res.status(404).send({ error: 'Not found' });
        }
      }

      // Determine the correct file path based on size
      let filePath = file.localPath;
      if (size) {
        filePath = `${file.localPath}_${size}`;
      }

      // Verify file exists on disk
      try {
        await fsPromises.access(filePath, fsPromises.constants.F_OK);
      } catch (error) {
        return res.status(404).send({ error: 'Not found' });
      }

      // Get the absolute path and set content type
      const absoluteFilePath = await fsPromises.realpath(filePath);
      const mimeType = contentType(file.name) || 'text/plain; charset=utf-8';
      res.setHeader('Content-Type', mimeType);

      // Send the file
      return res.sendFile(absoluteFilePath);
    } catch (error) {
      console.error('Error in getFile:', error);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
