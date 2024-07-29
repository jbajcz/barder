
import React from 'react';
import { useAudio } from './PlayAudioProvider';
import styles from './AudioPlayer.module.css';

const AudioPlayer: React.FC = () => {
    const { audio, playlist, currentTrackIndex, transitionToNextTrack } = useAudio();

    const togglePlayPause = () => {
        if (audio && audio.paused) {
            audio.play();
        } else if (audio) {
            audio.pause();
        }
    };

    return (
        <div className="text-center bg-black text-white">
            <p>
                Now Playing: {playlist[currentTrackIndex].nickname}
            </p>
            <button onClick={togglePlayPause}>
                {audio && audio.paused ? 'Play' : 'Pause'}
            </button>
            <button onClick={transitionToNextTrack} className= {styles.buttonSpacing}>
                Next
                
            </button>
        </div>
    );
};

export default AudioPlayer;
