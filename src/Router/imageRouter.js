const express = require('express');
const multer = require('multer');
const path = require('path');

// module

const { postImage } = require('./../service/imageService')
const { diskStorage } = require('./../util/diskStorage');


//


const imageFolder = path.join(__dirname, '../../public/image')
const imageRouter = express.Router();



const upload = multer({storage: diskStorage(imageFolder)})


imageRouter.post('/image', upload.single('image'), postImage)



module.exports = imageRouter;