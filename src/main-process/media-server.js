const { app, protocol } = require('electron');
const path = require('path');
const express = require('express');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const sendSeekable = require('send-seekable');
const outputFormat = 'wav';

console.log(__dirname);
ffmpeg.setFfmpegPath(path.join(__dirname, './media-server/ffmpeg/ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join(__dirname, './media-server/ffmpeg/ffprobe.exe'));

const protocolHandler = (request, callback) => {
    const filepath = request.url.slice(8);
    console.log('redirecting to ', `http://localhost:3000/${filepath}`);
    console.log('protocol request', request);
    callback({
        url: `http://localhost:3000/?file=${filepath}`,
        method: 'get'
    });
};

const server = express();

server.use(sendSeekable);

server.get('/', (req, res) => {
    console.log('express request', req.query);
    if (req.query.file === 'favicon.ico') {
        res.end();
    }
    const filepath = path.resolve(req.query.file);
    console.log('filepath', filepath);
    ffmpeg.ffprobe(filepath, (err, data) => {
        console.log(err);
        const formatData = data.format;
        const stream = ffmpeg(filepath).format(outputFormat);
        res.sendSeekable(stream, {
            type: mime.lookup(outputFormat),
            length: formatData.size
        });
    });
});

server.listen(3000, () => {
    console.log('listening ...');
});

app.on('ready', () => {
    protocol.registerHttpProtocol('media', protocolHandler, (error) => {
        if (error) console.error('Failed to register protocol');
    });
});

module.exports = {
    init: () => {}
};
