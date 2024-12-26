const fs = require('fs');
const path = require('path');



const createLogMessage = (message) => {


  try {

    const currentPath = path.join(__dirname, `../../logs/`)
    console.log(currentPath)
    const currentDate = new Date().toLocaleDateString();
    const time  = new Date().toISOString()
    console.log(time)


    if(!fs.existsSync(currentPath + '/' + `log_file_${currentDate}.txt`)) {
      fs.writeFileSync(currentPath + `log_file_${currentDate}.txt`, ``)
    }
    fs.appendFileSync(currentPath + `log_file_${currentDate}.txt`, `${time}\t\tnew message_${currentDate}\t\t\t${message}\n\n`)

  } catch (error) {
    console.error(`Ошибка при создании LOG ${error.message}`)
  }
}


module.exports = { createLogMessage };