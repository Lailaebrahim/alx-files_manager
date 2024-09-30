import fs from 'fs';
import { promises as fsPromises } from 'fs';

async function createDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            // With recursive: true: The function will create the entire directory path,
            // including any intermediate directories that do not exist.
            // Return Value: The await fsPromises.mkdir(dirPath, { recursive: true }) call returns a Promise that 
            // resolves to undefined if the directory already exists or is created successfully,
            // or an object with path and mode properties if the directory is created successfully with the recursive option.
            const dir = await fsPromises.mkdir(dirPath, { recursive: true });
            if (!dir) throw new Error('Directory creation failed');
        }
    } catch (error) {
        console.error('Error creating directory:', error);
    }
}

function convertFromBase64(base64String) {
    // Convert a base64 string to a Buffer
    const base64Data = base64String.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer;
}

export { convertFromBase64 , createDirectory};