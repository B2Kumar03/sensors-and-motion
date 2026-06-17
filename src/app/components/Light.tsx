import { useLight } from "@/hooks/useLight";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";


const Light = () => {

  const { available, light } = useLight();


  const brightness = useMemo(()=>{

    if(!light) return 0;

    return Math.min(
      Math.max(light / 1000 * 100,0),
      100
    );

  },[light]);



  const getLightStatus =()=>{

    if(!available)
      return "Sensor Not Available";


    if(brightness < 20)
      return "Dark Environment";


    if(brightness < 70)
      return "Normal Light";


    return "Bright Environment";

  };



return (

<LinearGradient

colors={[
"#020617",
"#111827",
"#0f172a"
]}

style={styles.container}

>


<SafeAreaView style={styles.safe}>


<Text style={styles.title}>
Light Sensor
</Text>


<Text style={styles.subtitle}>
Measure ambient brightness around you
</Text>





<View style={styles.statusCard}>


<View
style={[
styles.statusDot,
{
backgroundColor:
available
?"#22c55e"
:"#ef4444"
}
]}
/>


<Text style={styles.statusText}>
{getLightStatus()}
</Text>


</View>






{/* Light Display */}



<View style={styles.lightCard}>


<View

style={[
styles.glow,

{
opacity:
brightness / 100
}

]}

/>



<Text style={styles.sun}>
☀️
</Text>



<Text style={styles.value}>
{light?.toFixed(0) ?? 0}
</Text>


<Text style={styles.unit}>
Lux
</Text>



</View>







{/* Brightness Meter */}



<View style={styles.meter}>


<Text style={styles.heading}>
Brightness Level
</Text>



<View style={styles.progressBg}>


<View

style={[
styles.progress,
{
width:`${brightness}%`
}

]}

/>


</View>



<Text style={styles.percent}>
{brightness.toFixed(0)}%
</Text>


</View>







<View style={styles.infoRow}>


<InfoCard

title="Sensor"

value={
available
?"Active"
:"Offline"
}

/>



<InfoCard

title="Level"

value={
brightness < 30
?"Low"
:
brightness < 70
?"Medium"
:"High"
}

/>



<InfoCard

title="Unit"

value="Lux"

/>



</View>





</SafeAreaView>


</LinearGradient>

);

};







const InfoCard = ({
title,
value
}:{
title:string,
value:string
})=>{


return (

<View style={styles.infoCard}>


<Text style={styles.infoTitle}>
{title}
</Text>


<Text style={styles.infoValue}>
{value}
</Text>


</View>

)

};






export default Light;






const styles = StyleSheet.create({


container:{
flex:1
},



safe:{
flex:1,
padding:20
},



title:{
marginTop:20,
fontSize:32,
fontWeight:"900",
color:"#fff"
},



subtitle:{
marginTop:8,
color:"#94a3b8",
fontSize:15
},





statusCard:{
marginTop:30,
padding:18,
borderRadius:22,
backgroundColor:"rgba(255,255,255,0.08)",
flexDirection:"row",
alignItems:"center"
},



statusDot:{
height:12,
width:12,
borderRadius:20,
marginRight:12
},



statusText:{
color:"#fff",
fontSize:16,
fontWeight:"700"
},







lightCard:{
height:260,
marginTop:30,
borderRadius:40,
backgroundColor:"#1e293b",
alignItems:"center",
justifyContent:"center",
overflow:"hidden"
},



glow:{
position:"absolute",
height:180,
width:180,
borderRadius:100,
backgroundColor:"#fde047"
},



sun:{
fontSize:55
},



value:{
marginTop:15,
fontSize:42,
fontWeight:"900",
color:"#fff"
},



unit:{
fontSize:18,
color:"#cbd5e1"
},







meter:{
marginTop:25,
backgroundColor:"rgba(255,255,255,0.08)",
padding:20,
borderRadius:25
},



heading:{
color:"#fff",
fontSize:18,
fontWeight:"800"
},



progressBg:{
height:14,
marginTop:20,
backgroundColor:"#1e293b",
borderRadius:20,
overflow:"hidden"
},



progress:{
height:"100%",
backgroundColor:"#facc15",
borderRadius:20
},



percent:{
marginTop:10,
textAlign:"right",
color:"#fff",
fontWeight:"800"
},






infoRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:25
},



infoCard:{
width:"31%",
backgroundColor:"rgba(255,255,255,0.08)",
padding:15,
borderRadius:20,
alignItems:"center"
},



infoTitle:{
color:"#94a3b8",
fontSize:13
},



infoValue:{
marginTop:8,
fontSize:18,
fontWeight:"900",
color:"#fff"
}



});