import React from "react";
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';
import { View, Text, Button, Platform, KeyboardAvoidingView, TextInput, StyleSheet } from "react-native";


const firbase = require ("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
   constructor () {
    super();
        this.state = {
            messages: [],
        };
    

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyC9_pvKrjGynivyrSTgd02q3K9VRsqcU8U",
        authDomain: "chatbox-f7958.firebaseapp.com",
        projectId: "chatbox-f7958",
        storageBucket: "chatbox-f7958.appspot.com",
        messagingSenderId: "285159785820",
        appId: "1:285159785820:web:91fe4745bc58959495ed99"
      });
    }

    this.referencechatboxUser = firebase
      .firestore()
      .collection("messages");

   }
    
   componentDidMount() {
        this.setState({
            messages: [
                {
                  _id: 1,
                  text: 'Hello developer',
                  createdAt: new Date(),
                  user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/140/any',
                  },
                 },
                 {
                  _id: 2,
                  text: 'You have entered the chat',
                  createdAt: new Date(),
                  system: true,
                 },
              ]

        });

    }

    onSend(messages = {}) {
        this.setState((previousState) => ({  
            messages: GiftedChat.append (previousState.messages, messages),
        }));
    }

    renderBubble(props) {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: '#000'
              }
            }}
          />
        )
      }


    render() {
        let name = this.props.route.params.name;
        this.props.navigation.setOptions({ title: name });
        return(
           <View style={{flex: 1}}> 
              <GiftedChat 
                renderBubble={this.renderBubble.bind(this)}
                messages={this.state.messages}
                onSend={(messages) => this.onSend(messages)}
                user={{
                    _id: 1,
              }}
              />
             { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
             }
           </View> 

        );
    }

}