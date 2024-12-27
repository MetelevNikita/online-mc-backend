const { createLogMessage } = require('./../util/logFile')


const postImage = (req, res) => {
  try {


    console.log(req.file)

    createLogMessage(`Загружен файл ${req.file.filename} - размер файла ${Math.floor(req.file.size / 1024 ** 2)}.mb`)
    res.status(200).json(req.file)

  } catch (error) {

    res.status(500).json({message: `Изображение не загружено ${error}`})

  }
}


module.exports = { postImage }