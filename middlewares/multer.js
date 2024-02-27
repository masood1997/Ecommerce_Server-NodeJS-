import multer from 'multer';

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data/images/users');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  }
});

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data/images/products');
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  }
});

const uploadSingle = multer({ storage: userStorage }).single('profilePic');

const uploadMultiple = multer({ storage: productStorage }).array('productImage');

export { uploadSingle, uploadMultiple };
