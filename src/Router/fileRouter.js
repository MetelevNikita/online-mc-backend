const express = require('express');
const multer = require('multer');
const path = require('path');

// modules

const { diskStorage } = require('./../util/diskStorage');
const { getFiles, getSingleFile, postFile, downloadFile } = require('./../service/fileService')

//

const videoPath = path.join(__dirname, '../../public/video');

//

const fileRouter = express.Router();
const upload = multer({ storage: diskStorage(videoPath) });

//


fileRouter.get('/file', getFiles)


fileRouter.get('/file/:id', getSingleFile)


fileRouter.post('/file', upload.single('file'), postFile)

fileRouter.get('/download', downloadFile)

//




module.exports = fileRouter;

