const { ipcMain } = require('electron');

class LinuxIntegration {
    constructor(win) {
        this.window = win;
    }

    enable() {
        ipcMain.on('appReady', () => {
            console.log('works');
        });
    }
}

module.exports = LinuxIntegration;
