import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import CustomError from './ErrorClass.js';
import path from 'path';
import fs from 'fs';

config({
  path: './data/config.env'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    const folderName = path.basename(path.resolve(localFilePath));
    //upload the file
    const { secure_url, public_id } = await cloudinary.uploader.upload(localFilePath, {
      overwrite: true,
      folder: folderName,
      resource_type: 'image',
      use_filename: true
    });

    fs.unlinkSync(localFilePath);
    return { secure_url, public_id };
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new CustomError('Error Uploading Photo', 500);
  }
};

const destroyOldPhoto = async (public_id) => {
  await cloudinary.uploader.destroy(public_id);
};

export { uploadOnCloudinary, destroyOldPhoto };
