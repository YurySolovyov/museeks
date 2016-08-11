import app from './app';


class Player {

    constructor(options) {

        this.audio = new Audio();

        this.audio.playbackRate = options.playbackRate || 1;
        this.audio.volume = options.playbackRate || 1;
        this.audio.muted = options.muted || false;
        this.audio.preload = 'metadata';
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
    }

    mute() {
        this.audio.muted = true;
    }

    unmute() {
        this.audio.muted = false;
    }

    getAudio() {
        return this.audio;
    }

    setAudioVolume(volume) {
        this.audio.volume = volume;
    }

    setAudioPlaybackRate(playbackRate) {
        this.audio.playbackRate = playbackRate;
    }

    setAudioSrc(src) {
        const newSrc = `media://localhost/?file=${src}`;
        this.audio.src = newSrc;
    }

    setAudioCurrentTime(currentTime) {
        this.audio.currentTime = currentTime;
    }
}

export default new Player({
    volume       : app.config.get('audioVolume'),
    playbackRate : app.config.get('audioPlaybackRate'),
    muted        : app.config.get('audioMuted')
});
