import multer from 'multer';
import fs from 'fs';

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = './data/images/users';
    fs.mkdirSync(dest, { recursive: true }); // Create directory recursively if it doesn't exist
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  }
});

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = './data/images/products';
    fs.mkdirSync(dest, { recursive: true }); // Create directory recursively if it doesn't exist
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  }
});

const uploadSingle = multer({ storage: userStorage }).single('profilePic');

const uploadMultiple = multer({ storage: productStorage }).array('productImage');

export { uploadSingle, uploadMultiple };
