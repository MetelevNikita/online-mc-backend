const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// modules


const fileRouter = require('./Router/fileRouter');

//

const app = express();

const videoPath = path.join(__dirname, '../public/video');
console.log(videoPath)


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(videoPath));
app.use('/file', express.static(path.join(__dirname, '../public/output')))

// router

app.use('/api/v1', fileRouter)

//

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// web socket

wss.on('connection', (ws) => {
  console.log('Подключение установлено');


  ws.on('message', (message) => {

        try {

          const { bitrate, aspect, size, logo, fileName  } = JSON.parse(message);

          const pathFile = path.parse(fileName);
          const outputPath = `D:/NODE JS/onlineConverter/backend/public/output/${pathFile.name}_converted${pathFile.ext}`
          const sizeVideo= size.split('x');

          //

          const verticalWidth = sizeVideo[0] / 3;

          //

          const overlayXPosition = sizeVideo[0] - 200;
          const overlayYPosition = 100;



          (!logo) ?

          ffmpeg().input(fileName).videoBitrate(bitrate).videoCodec('libx264').audioCodec('aac').complexFilter([

            {
              filter: 'crop',
              options: (aspect !=='9:16') ? {w: sizeVideo[0], h: sizeVideo[1]} : {w: verticalWidth, h: sizeVideo[1]},
              inputs: ['0:v'],
              outputs: ['res']
            }

          ], 'res').format('mp4').on('start', (commandLine) => {
            console.log('Конвертация началась:', commandLine);
            ws.send(JSON.stringify({ event: 'start', message: commandLine }));

          })
          .on('progress', (progress) => {
            console.log(`progress: ${progress.percent}%`);
            ws.send(JSON.stringify({ event: 'progress', message: progress.percent }))
          })
          .on('error', (err) => {
            console.error('Ошибка:', err.message);
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          })
          .on('end', () => {
            console.log('Конвертация завершена');
            ws.send(JSON.stringify({ event: 'end', message: 'Конвертация завершена' }));

          })
          .save(outputPath)

          :

          ffmpeg().input(fileName).input(logo).videoBitrate(bitrate).videoCodec('libx264').audioCodec('aac').complexFilter([

            {
              filter: 'crop',
              options: (aspect !=='9:16') ? {w: sizeVideo[0], h: sizeVideo[1]} : {w: verticalWidth, h: sizeVideo[1]},
              inputs: ['0:v'],
              outputs: ['crop']
            },

            { filter: 'scale',
              options: {w: 100, h: 100},
              inputs: ['1:v'],
              outputs: ['scale']
            },

            {
              filter: 'overlay',
              options: {x: 50, y: 50},
              inputs: ['crop', 'scale'],
              outputs: ['res']
            }

          ], 'res').format('mp4').on('start', (commandLine) => {
            console.log('Конвертация началась:', commandLine);
            ws.send(JSON.stringify({ event: 'start', message: commandLine }));

          })
          .on('progress', (progress) => {
            console.log(`progress: ${progress.percent}%`);
            ws.send(JSON.stringify({ event: 'progress', message: progress.percent }))
          })
          .on('error', (err) => {
            console.error('Ошибка:', err.message);
            ws.send(JSON.stringify({ event: 'error', message: err.message }));
          })
          .on('end', () => {
            console.log('Конвертация завершена');
            ws.send(JSON.stringify({ event: 'end', message: 'Конвертация завершена' }));

          })
          .save(outputPath)


        } catch (error) {
          console.log(`ОШИБКА!!!! ${error}`);
          ws.send({event: 'error', message: error.message })
          ws.close(1000, 'соединение остановлено')
        }

  })
})






// server


const PORT = process.env.PORT || 5000;


server.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
})

