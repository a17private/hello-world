import React from "react";
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';
import { View, Text, Button, Platform, KeyboardAvoidingView, TextInput, StyleSheet } from "react-native";


const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
   constructor () {
    super();
        this.state = {
         messages: [],
       };
        
      
      if (!firebase.apps.length){
        firebase.initializeApp( {
          apiKey: "AIzaSyC9_pvKrjGynivyrSTgd02q3K9VRsqcU8U",
          authDomain: "chatbox-f7958.firebaseapp.com",
          projectId: "chatbox-f7958",
          storageBucket: "chatbox-f7958.appspot.com",
          messagingSenderId: "285159785820",
          appId: "1:285159785820:web:91fe4745bc58959495ed99"
        });
        }

        // create a reference to the active user's documents (shopping lists)
        this.referenceChatMessages = firebase.firestore().collection('messagees').where("uid", "==", this.state.uid);
      
      }

    
      componentDidMount() {
        this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            firebase.auth().signInAnonymously();
          }
          this.setState({
            uid: user.uid,
            messages: [],
          });
          this.unsubscribemessagesUser = this.referenceChatMessagesUser
            .orderBy("createdAt", "desc")
            .onSnapshot(this.onCollectionUpdate);
        });
      }
      


       componentWillUnmount() {
        this.unsubscribeChatMessages();
      }



      onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
          // get the QueryDocumentSnapshot's data
          let data = doc.data();
          messages.push({
            _id: data._id,
            text: data.text,
            createdAt: data.createdAt.toDate(),
            user: data.user,
          });
        });

        this.setState({
          messages,
        });
      };

      addMessages() {
        this.referenceChatMessages.add({
          text: 'Hello',
          createdAt: '9:00',
          user: 'MockUser',
          uid: this.state.uid,
        });
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

            <Button 
                      onPress={() => {
                        this.addMessages();
                      }}
                      title = "Start Chat"
                    />

           </View> 

        );
    }

}