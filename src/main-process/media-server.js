const { app, protocol } = require('electron');
const os = require('os');
const path = require('path');
const querystring = require('querystring');
const express = require('express');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const sendSeekable = require('send-seekable');

const outputFormat = 'wav';
const platform = os.platform();
const server = express();
let port = 0;

const getExecutablePath = () => {
    const ffmpeg = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    const ffprobe = platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
    return {
        ffmpegPath: path.join(__dirname, './media-server/ffmpeg', ffmpeg),
        ffproblePath: path.join(__dirname, './media-server/ffmpeg', ffprobe)
    };
};

const { ffmpegPath, ffproblePath } = getExecutablePath();

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffproblePath);

const mediaProtocolHandler = (request, callback) => {
    const filepath = request.url.slice(9);

    callback({
        url: `http://localhost:${port}/?file=${filepath}`,
        method: 'get'
    });
};

const metadataProtocolHandler = (request, callback) => {
    const pathKey = 'metadata://localhost/?file';
    const filepath = querystring.parse(request.url)[pathKey];

    ffmpeg.ffprobe(filepath, (err, data) => {
        const meta = JSON.stringify(data.format);
        callback({
            data: meta,
            mimeType: mime.lookup('json')
        });
    });
};

server.use(sendSeekable);

server.get('/', (req, res) => {
    if (req.query.file === 'favicon.ico') {
        res.end();
    }

    const filepath = path.resolve(req.query.file);

    ffmpeg.ffprobe(filepath, (err, meta) => {
        const stream = ffmpeg(filepath).format(outputFormat);
        res.append('X-Content-Duration', meta.format.duration.toString());
        res.sendSeekable(stream, {
            type: mime.lookup(outputFormat),
            length: meta.format.size
        });
    });
});

const listener = server.listen(0, () => {
    port = listener.address().port;
    console.log(`listening on port ${port} ...`);
});

app.on('ready', () => {
    protocol.registerHttpProtocol('media', mediaProtocolHandler, (error) => {
        if (error) console.error('Failed to register media protocol', error);
    });

    protocol.registerStringProtocol('metadata', metadataProtocolHandler, (error) => {
        if (error) console.error('Failed to register metadata protocol', error);
    });
});

module.exports = {
    init: () => {}
};
