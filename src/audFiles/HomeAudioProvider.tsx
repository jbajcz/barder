'use client';

import React, {createContext, useState, useEffect, useContext } from 'react';

interface AudioContextType {
    audio: HTMLAudioElement | null;
    playlist: {url: string, nickname: string }[];
    stopAudio: () => void;
}

const defaultAudioContext: AudioContextType = {
    audio: null,
    playlist: [],
    stopAudio: () => {},
}

const AudioContext = createContext<AudioContextType>(defaultAudioContext);

export const useAudio = () => {
    return useContext(AudioContext);
};

interface Props {
    children: React.ReactNode;
}

const HomeAudioProvider: React.FC<Props> = ({ children }) => {
    const [playlist, setPlaylist] = useState([
        { url: 'http://localhost:5000/static/audio/SLPSTRMSideHustle.mp3', nickname: 'SLPSTRM - Side Hustle' },
    ]);


    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const currentTrack = playlist[0];
        const newAudio = new Audio(currentTrack.url);
        newAudio.loop = true;
        setAudio(newAudio);
        newAudio.play().catch(error => console.error("Audio play error:", error));

        return () => {
            if (newAudio) {
                newAudio.pause();
                newAudio.src = "";
            }
        };
        
    }, [playlist]);

    const stopAudio = () => {
        if (audio) {
            audio.pause();
        }
    };


    return (
        <AudioContext.Provider value={{ audio, playlist, stopAudio }}>
            {children}
        </AudioContext.Provider>
    );
};

export default HomeAudioProvider;
