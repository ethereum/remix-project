module.exports = (remixd, folder) => {
    console.log('set folder', folder, remixd.services.sharedFolder.sharedFolder)
    remixd.services.sharedFolder.sharedFolder(folder, false)
    remixd.services.sharedFolder.setupNotifications(folder)
}
