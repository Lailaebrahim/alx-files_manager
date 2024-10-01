import Queue from 'bull';
import imgThumbnail from 'image-thumbnail';
import dbClient from '../utils/db';

const fileQueue = new Queue('thumbnail generation');

const generateThumbnail = async (filePath, size) => {
  const buffer = await imgThumbnail(filePath, { width: size });
  console.log(`Generating file: ${filePath}, size: ${size}`);
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

fileQueue.process(async (job, done) => {
    const { fileId } = job.data.fileId;
    const { userId } = job.data.userId;
    if (!fileId) {
        done(new Error('Missing fileId'));
    }
    if (!userId) {
        done(new Error('Missing userId'));
    }
    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(user._id) });
    if (!file) done(new Error('File not found'));
    const filePath = file.localPath;
    const size = [500, 250, 100]
    const promises = size.map((s) => generateThumbnail(filePath, s));
    await Promise.all(promises);
    done();
})