const os = require('os');
const { dialog } = require('electron')

module.exports = () => {
    return new Promise((resolve, reject) => {
        dialog.showOpenDialog(
            { 
              defaultPath: os.homedir(),
              buttonLabel: "Open",
              title: 'Select Working Directory (Default to the Home directory)', 
              properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
              message: 'Working Directory'
            }).
            then((result) => {
              if (result.canceled || result.filePaths.length === 0) {
                resolve(os.homedir())
              } else {
                resolve(result.filePaths[0])
              }
            }).
            catch((error) => reject(error))
    })    
}