import React from "react";
import { View, Text, Button, TextInput, StyleSheet, ImageBackground } from "react-native";

const image = require("../assets/icon.jpg");

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center'
    },
    backgroundImage: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
      },
  });

export default class Start extends React.Component {
    constructor(props) {
        super(props);
        this.state = { name: "" };
    }

    
    render() {
        return(
           
           
            <ImageBackground source={image} style={styles.backgroundImage} >
               <View style={styles.container}>
                <Text style={{ color: "#Black", fontSize: 12, fontWeight: 600 }}>write your name!</Text>
                    <TextInput 
                     style={{ height: 40, borderColor: "grey", borderWidth: 1, backgroundColor: "white", padding: 10,  }}
                     onChangeText={(name) => this.setState({ name })}
                     value={this.state.name}
                     placeholder="Type here..."
                     />
                    <Button
                        title="Chat"
                        onPress={() => 
                            this.props.navigation.navigate("Chat", { name: this.state.name })
                         }  style={{ color: "#000", backgroundColor: "#fff" }}
                    />
                   </View>
                 </ImageBackground>
           
            
        )
    }
    
}