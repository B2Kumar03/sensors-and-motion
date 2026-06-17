import {useState, useEffect} from 'react';
import {LightSensor} from 'expo-sensors';
import {Platform} from 'react-native';

export const useLight=()=>{
    const [available, setAvailable] = useState<boolean | null>(null);
    const [light, setLight] = useState(0);

    useEffect(()=>{
        if (Platform.OS !== "android") {
      setAvailable(false);
      return;
    }
        let subscription = {remove:()=>{}};
        (async()=>{
           const isAvailable = await LightSensor.isAvailableAsync();
            setAvailable(isAvailable);
            if(!isAvailable){
                return;
            }
            LightSensor.setUpdateInterval(100);
            subscription = LightSensor.addListener((lightData)=>{
                setLight(lightData.illuminance);
            })

        })()
        return ()=>{
            subscription.remove();
        }
    },[])
    
 return {available, light};
}