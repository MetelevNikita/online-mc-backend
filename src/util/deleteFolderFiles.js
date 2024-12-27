const fs = require('fs');
const schedule = require('node-schedule');
const path = require('path');



const deleteFile = (folder) => {

  try {
    const files = fs.readdirSync(folder)

    for (const file of files) {

      const pathToFile =  path.join(folder, file)

      if(fs.statSync(pathToFile).isFile()) {
        fs.unlinkSync(pathToFile)
      }
    }

  } catch (error) {
    console.log(`Не удалось удалить файлы с сервера код ошибки - ${error.code}`);
  }

}

module.exports = { deleteFile }