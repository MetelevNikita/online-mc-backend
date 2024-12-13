const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');

//

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('../public'));

//

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// web socket

wss.on('connection', (ws) => {
  console.log('Подключение установлено');


  ws.on('message', (message) => {

        try {

          const { inputFile, outputPath, bitrate, aspect, size, logo  } = JSON.parse(message);
          console.log(inputFile, outputPath);
          console.log(bitrate, aspect, size, logo);
          const sizeVideo= size.split('x');

          //

          const verticalWidth = sizeVideo[0] / 3;

          //

          const overlayXPosition = sizeVideo[0] - 200;
          const overlayYPosition = 100;



          const command = ffmpeg().input(inputFile).input(logo).videoBitrate(bitrate).videoCodec('libx264').audioCodec('aac').complexFilter([

            {
              filter: 'crop',
              options: (aspect !=='9:16') ? {w: sizeVideo[0], h: sizeVideo[1]} : {w: verticalWidth, h: sizeVideo[1]},
              inputs: ['0:v'],
              outputs: (logo === '') ? ['res'] : ['crop']
            },

            { filter: 'scale',
              options: {w: 150, h: 150},
              inputs: ['1:v'],
              outputs: ['scale']
            },

            {
              filter: 'overlay',
              options: {x: overlayXPosition, y: overlayYPosition},
              inputs: ['crop', 'scale'],
              outputs: ['res']
            }

          ], 'res').format('mp4')

          .on('start', (commandLine) => {
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
        }

      })

})


// server


server.listen(process.env.PORT, () => {
  console.log(`Server is running ${process.env.PORT}`);
})