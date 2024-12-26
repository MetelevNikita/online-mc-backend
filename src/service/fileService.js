const fs = require('fs')
const path = require('path')

// util

const { createLogMessage } = require('./../util/logFile')

//


let inputFile = ''
let outputFile = ''


const getFiles = (req, res) => {

  try {

    const filesFolder = fs.readdirSync(path.resolve(__dirname, '../../public/video'))
    console.log(filesFolder)

    if(filesFolder.length === 0) {
      res.status(200).json({message: 'Файлов нет'})
      return
    }
    res.status(200).json({message: 'Файлы получены'})

  } catch (error) {
    res.status(500).json({message: `Ошибка полуения файлов ${error.message}`})
  }

}



const getSingleFile = (req, res) => {

  try {



    const pathToFile = path.resolve(__dirname, `../../public/output/${fileName}_converted.${fileExt}`)
    console.log(pathToFile)

    const findFile = fs.readFileSync(pathToFile)
    console.log(findFile)

    res.download(path.resolve(__dirname, `../../public/output/${fileName}.${fileExt}`), `${fileName}.${fileExt}`, (err) => {
      if(err) {
       console.log(err)
       return
      }

      console.log('файл скачен')
    })

    res.status(200).json({message: 'Файл получен'})
  } catch (error) {
    res.status(500).json({message: `Ошибка полуения файлов ${error.message}`})
  }

}




const postFile = (req, res) => {

  try {
    console.log(req.file)
    inputFile = req.file.originalname
    outputFile = path.resolve(__dirname, `../../public/output/${req.file.originalname.slice(0, -4)}_coverted.mp4`)

    createLogMessage(`Загружен файл ${req.file.filename} - размер файла ${Math.floor(req.file.size / 1024 ** 2)}.mb`)

    res.status(200).json(req.file)

  } catch (error) {
    res.status(500).json({message: `Ошибка полуения файлов ${error.message}`})
  }

}





const downloadFile = (req, res) => {

  try {

    const file = path.resolve(__dirname, `../../public/output/${inputFile.slice(0, -4)}_converted.mp4`)
    console.log(file)

    res.download(file)

  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: `Ошибка полуения файлов ${error.message}`})
  }

}


//


module.exports = { getFiles, getSingleFile, postFile, downloadFile }