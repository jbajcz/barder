
import React, { useState, useEffect } from 'react';
import { useAudio } from './PlayAudioProvider';
import styles from './AudioPlayer.module.css';

const AudioPlayer: React.FC = () => {
    const { audio, playlist, currentTrackIndex, transitionToNextTrack } = useAudio();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const currentTrack = playlist[currentTrackIndex];
    
    const togglePlayPause = () => {
        if (audio && audio.paused) {
            audio.play();
            setIsPlaying(true);
        } else if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, [audio]);

    return (
        <div className="text-center bg-black text-white">
            {currentTrack ? (
                <p>
                Now Playing: {playlist[currentTrackIndex].nickname}
                </p>
            ) : (
                <p>
                    No track available
                </p>
            )}
            
            <button onClick={togglePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={transitionToNextTrack} className= {styles.buttonSpacing}>
                Next
                
            </button>
        </div>
    );
};

export default AudioPlayer;
