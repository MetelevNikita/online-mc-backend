const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

// modules


const fileRouter = require('./Router/fileRouter');
const imageRouter = require('./Router/imageRouter');
const { createLogMessage } = require('./util/logFile');
const { deleteFile } = require('./util/deleteFolderFiles');

//

const app = express();

const videoPath = path.join(__dirname, '../public/video');
const outputPath = path.join(__dirname, '../public/output');
const imagePath = path.join(__dirname, '../public/image');


app.use(cors({
  origin: 'http://utv-stream.ru',  // Разрешить запросы с этого домена
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(express.static(videoPath));
app.use('/file', express.static(path.join(__dirname, '../public/output')))

// router

app.use('/api/v1', fileRouter)
app.use('/api/v1', imageRouter)

//

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// web socket

wss.on('connection', (ws) => {
  console.log('Подключение установлено');


  ws.on('message', (message) => {

        try {

          const { bitrate, aspect, size, logo, fileName  } = JSON.parse(message);
          let totalTime


          console.log(logo)

          const pathFile = path.parse(fileName);
          const pathImage = path.parse(logo)


          const outputPath = path.join(__dirname, `../public/output/${pathFile.name}_converted.mp4`)
          const sizeVideo= size.split('x');

          //

          const verticalWidth = sizeVideo[0] / 3;

          //

          const overlayXPosition = sizeVideo[0] - 200;
          const overlayYPosition = 100;



          (!logo) ?

          ffmpeg().input(fileName).videoBitrate(bitrate).outputOptions(['-progress pipe:','-vcodec libx264','-acodec aac']).complexFilter([

          `scale=${sizeVideo[0]}:${sizeVideo[1]}, ${(aspect === '9:16') ? `crop=in_w/3:in_h` : `crop=in_w:in_h`}`

          ]).format('mp4').on('start', (commandLine) => {
            console.log('Конвертация началась:', commandLine);
            ws.send(JSON.stringify({ event: 'start', message: commandLine }));

          })
          .on('codecData', (data) => {
            totalTime = parseInt(data.duration.replace(/:/g, ''))

          })
          .on('progress', (progress) => {
            const time = parseInt(progress.timemark.replace(/:/g, ''))
            const percent = (time / totalTime) * 100
            console.log(`progress: ${percent}%`);
            ws.send(JSON.stringify({ event: 'progress', message: percent }))
          })
          .on('error', (err) => {
            console.error('Ошибка:', err.message);
            createLogMessage('Ошибка:', err.message)
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          })
          .on('end', () => {
            console.log('Конвертация завершена');
            const outputFileStat = fs.statSync(path.join(__dirname, `../public/output/${pathFile.name}_converted.mp4`))
            createLogMessage(`Файл сконвертирован ${pathFile.name}_converted${pathFile.ext} - рамзер файла ${outputFileStat.size} kb`)
            ws.send(JSON.stringify({ event: 'end', message: 'Конвертация завершена' }));

          })
          .save(outputPath)

          :

          ffmpeg().input(fileName).input(logo).videoBitrate(bitrate).outputOptions(['-progress pipe:','-vcodec libx264','-acodec aac']).complexFilter([

            `[0:v] scale=${sizeVideo[0]}:${sizeVideo[1]}[scaled], ${(aspect === '9:16') ? `[scaled]crop=in_w/3:in_h[croped]` : `[scaled]crop=in_w:in_h[croped]`}, [1:v]scale=100:100[logo], [croped][logo]overlay=x=(W-100):y=0[res]`

          ], 'res').format('mp4').on('start', (commandLine) => {
            console.log('Конвертация началась:', commandLine);
            ws.send(JSON.stringify({ event: 'start', message: commandLine }));

          })
          .on('codecData', (data) => {
            totalTime = parseInt(data.duration.replace(/:/g, ''))
          })
          .on('progress', (progress) => {
            const time = parseInt(progress.timemark.replace(/:/g, ''))
            const percent = (time / totalTime) * 100
            console.log(`progress: ${percent}%`);
            ws.send(JSON.stringify({ event: 'progress', message: percent }))
          })
          .on('error', (err) => {
            console.error('Ошибка:', err.message);
            createLogMessage('Ошибка:', err.message)
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          })
          .on('end', () => {
            console.log('Конвертация завершена');
            const outputFileStat = fs.statSync(path.join(__dirname, `../public/output/${pathFile.name}_converted.mp4`))
            createLogMessage(`Файл сконвертирован ${pathFile.name}_converted${pathFile.ext} - рамзер файла ${outputFileStat.size} kb`)
            ws.send(JSON.stringify({ event: 'end', message: 'Конвертация завершена' }));
          })
          .save(outputPath)

        } catch (error) {
          console.log(`ОШИБКА!!!! ${error}`);
          ws.send({event: 'error', message: error.message })
          createLogMessage(`Ошибка ${error.message}`)
          ws.close(1000, 'соединение остановлено')
        }

  })
})



// delete files


const job = schedule.scheduleJob('00 05 * * *', (fireDate) => {
  console.log('fireDate', fireDate)
  deleteFile(videoPath)
  deleteFile(outputPath)
  deleteFile(imagePath)
})




// server


const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
})

