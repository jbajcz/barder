import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import useSharedTraderNameStatus from "@/app/hook/useTraderStatus";
import useCurrentMood from "@/app/hook/useCurrentMood";
import useSharedSuccessStatus from "@/app/hook/useSuccessStatus";

interface AudioContextType {
    audio: HTMLAudioElement | null;
    playlist: { url: string, nickname: string }[];
    currentTrackIndex: number;
    transitionToNextTrack: () => void;
}

const defaultAudioContext: AudioContextType = {
    audio: null,
    playlist: [],
    currentTrackIndex: 0,
    transitionToNextTrack: () => {},
}

const AudioContext = createContext<AudioContextType>(defaultAudioContext);

export const useAudio = () => {
    return useContext(AudioContext);
};

interface Props {
    children: React.ReactNode;
    playHomeSong: boolean;
}

const getRandomTrackIndex = (playlistLength: number, excludeIndex: number) => {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * playlistLength);
    } while (randomIndex === excludeIndex);
    return randomIndex;
}

const PlayAudioProvider: React.FC<Props> = ({ children, playHomeSong }) => {
    const { currentMood } = useCurrentMood();
    const { success } = useSharedSuccessStatus();
    const { traderStatus } = useSharedTraderNameStatus();
    const [check, setCheck] = useState<boolean>(false);
    const [playlist, setPlaylist] = useState([
        { url: 'http://localhost:5000/static/audio/DanielJosephWhitChronicle.mp3', nickname: 'Daniel Joseph White - Chronicle' },
        { url: 'http://localhost:5000/static/audio/OmriSmadarMuftakDansi.mp3', nickname: 'Omri Smadar - Muftak Dansi' },
        { url: 'http://localhost:5000/static/audio/RexBannerVibewithMeNoBackingVocals.mp3', nickname: 'Rex Banner - Vibe with Me' },
    ]);

    useEffect(() => {
        if ( currentMood === "Angry") {
            setPlaylist([
                { url: 'http://localhost:5000/static/audio/ArdieSonFury.mp3', nickname: 'Ardie Son - Fury' },
                { url: 'http://localhost:5000/static/audio/DoverQuartetTheFourSeasonsSummer3PrestoVivaldi.mp3', nickname: 'Dover Quartet - The Four Seasons' },
                { url: 'http://localhost:5000/static/audio/MiguelJohnsonUnexploredMoon.mp3', nickname: 'Miguel Johnson - Unexplored Moon'},
                { url: 'http://localhost:5000/static/audio/TorontoCanadaKiilstofte.mp3', nickname: 'Kiilstofte - Toronto Canada'},
            ]);

            setCheck(true);
            
        } else {
            if (check){
                setCurrentTrackIndex(0);
                setPlaylist([
                    { url: 'http://localhost:5000/static/audio/DanielJosephWhitChronicle.mp3', nickname: 'Daniel Joseph White - Chronicle' },
                    { url: 'http://localhost:5000/static/audio/OmriSmadarMuftakDansi.mp3', nickname: 'Omri Smadar - Muftak Dansi' },
                    { url: 'http://localhost:5000/static/audio/RexBannerVibewithMeNoBackingVocals.mp3', nickname: 'Rex Banner - Vibe with Me' },
                ]);
                setCheck(false);
            }  
        }
    }, [check, currentMood]);

    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const transitionToNextTrack = useCallback(() => {
        setCurrentTrackIndex(prevIndex => getRandomTrackIndex(playlist.length, prevIndex));
    }, [playlist.length]);


    useEffect(() => {
        if (typeof window !== "undefined" && playlist.length > 0) {
            const currentTrack = playlist[currentTrackIndex];
            const newAudio = new Audio(currentTrack.url);
            setAudio(newAudio);
        }
    }, [currentTrackIndex, playlist]);

    useEffect(() => {
        if (audio) {
            const handleTimeUpdate = () => {
                if (audio.currentTime >= audio.duration) {
                    transitionToNextTrack();
                }
            };

            audio.loop = false;
            audio.play().catch(error => console.error("Audio play error:", error));

            audio.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                audio.pause();
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.src = "";
            };
        }
    }, [audio, transitionToNextTrack]);

    return (
        <AudioContext.Provider value={{ audio, playlist, currentTrackIndex, transitionToNextTrack }}>
            {children}
        </AudioContext.Provider>
    );
};

export default PlayAudioProvider;
