import {useState, useEffect} from 'react';
import {Padometer} from 'expo-sensors';


export const usePadometer = () => {
    const [available, setAvailable] = useState<boolean | null>(null);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [z, setZ] = useState(0);