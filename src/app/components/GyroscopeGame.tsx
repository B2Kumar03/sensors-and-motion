import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGyroscope } from "@/hooks/useGyroscope";


const GyroscopeGame = () => {

  const { available, x, y, z } = useGyroscope(50);


  const movement = useMemo(() => {

    const value = Math.sqrt(
      x * x +
      y * y +
      z * z
    );

    return Math.min(value * 100,100);

  },[x,y,z]);



  const rotateX = useMemo(()=>{

    return `${Math.max(
      Math.min(y * 20,20),
      -20
    )}deg`;

  },[y]);



  const rotateY = useMemo(()=>{

    return `${Math.max(
      Math.min(x * 20,20),
      -20
    )}deg`;

  },[x]);



  const getStatus =()=>{

    if(!available)
      return "Sensor Offline";


    if(movement < 20)
      return "Device Stable";


    if(movement < 60)
      return "Tilt Detected";


    return "High Motion";

  }



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
Gyroscope Game
</Text>


<Text style={styles.subtitle}>
Tilt your phone and control the card
</Text>




<View style={styles.statusCard}>


<View
style={[
styles.dot,
{
backgroundColor:
available
?"#22c55e"
:"#ef4444"
}
]}
/>


<Text style={styles.statusText}>
{getStatus()}
</Text>


</View>





<View style={styles.meterBox}>


<Text style={styles.label}>
Motion Power
</Text>


<View style={styles.progressBg}>

<View
style={[
styles.progress,
{
width:`${movement}%`
}
]}
/>


</View>



<Text style={styles.percent}>
{movement.toFixed(0)}%
</Text>



</View>





{/* 3D TILT CARD */}



<View style={styles.tiltContainer}>


<Animated.View

style={[
styles.tiltCard,

{

transform:[

{
perspective:800
},

{
rotateX
},

{
rotateY
}

]

}

]}

>



<Text style={styles.cardEmoji}>
🎮
</Text>


<Text style={styles.cardTitle}>
Tilt Controller
</Text>



<Text style={styles.cardDesc}>
Move your phone
to rotate this card
</Text>



<View style={styles.innerCircle}/>


</Animated.View>


</View>






<View style={styles.axisRow}>


<AxisCard
title="X"
value={x}
/>


<AxisCard
title="Y"
value={y}
/>


<AxisCard
title="Z"
value={z}
/>


</View>





</SafeAreaView>


</LinearGradient>

);

};





const AxisCard = ({
title,
value
}:{
title:string,
value:number
})=>{


return (

<View style={styles.axisCard}>


<Text style={styles.axisTitle}>
{title} Axis
</Text>


<Text style={styles.axisValue}>
{value.toFixed(3)}
</Text>


</View>

)

};






export default GyroscopeGame;






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



dot:{
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





meterBox:{
marginTop:25,
padding:20,
borderRadius:25,
backgroundColor:"rgba(255,255,255,0.08)"
},



label:{
color:"#fff",
fontSize:18,
fontWeight:"700"
},



progressBg:{
height:12,
backgroundColor:"#1e293b",
borderRadius:20,
marginTop:15,
overflow:"hidden"
},


progress:{
height:"100%",
backgroundColor:"#38bdf8",
borderRadius:20
},



percent:{
color:"#fff",
textAlign:"right",
marginTop:8,
fontWeight:"800"
},






tiltContainer:{
height:280,
alignItems:"center",
justifyContent:"center",
marginTop:20
},




tiltCard:{
height:200,
width:260,
borderRadius:35,
backgroundColor:"#0ea5e9",
alignItems:"center",
justifyContent:"center",

shadowColor:"#000",
shadowOpacity:.5,
shadowRadius:20,
elevation:15

},



cardEmoji:{
fontSize:45
},



cardTitle:{
marginTop:15,
fontSize:24,
fontWeight:"900",
color:"#fff"
},



cardDesc:{
marginTop:10,
color:"#e0f2fe",
textAlign:"center"
},



innerCircle:{
position:"absolute",
height:120,
width:120,
borderRadius:100,
backgroundColor:"rgba(255,255,255,0.15)"
},







axisRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
},



axisCard:{
width:"31%",
padding:15,
borderRadius:20,
backgroundColor:"rgba(255,255,255,0.08)",
alignItems:"center"
},



axisTitle:{
color:"#94a3b8"
},



axisValue:{
marginTop:8,
color:"#fff",
fontSize:20,
fontWeight:"900"
}



});