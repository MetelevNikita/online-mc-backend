const multer = require('multer');



const diskStorage = (path) => {

  try {

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path)
      },
      filename: (req, file, cb) => {
        console.log(file.originalname)
        cb(null, file.originalname)
      }
    })

    return storage


  } catch (error) {
    console.log(error);
  }


}



module.exports = { diskStorage };

