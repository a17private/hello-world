import React from "react";
import { GiftedChat, Bubble  } from 'react-native-gifted-chat';
import { View, Text, Button, Platform, KeyboardAvoidingView, TextInput, StyleSheet } from "react-native";
import firebase from 'firebase';

//const firebase = require('firebase');
//require('firebase/firestore'); ~ old syntax

export default class Chat extends React.Component {
   constructor () {
    super();
        this.state = {
        uid: 0,
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

        // create a reference to the active user's documents (chatApp)
        this.referenceChatMessages = firebase.firestore().collection('messages');
        this.refMsgsUser = null;
      
      }

    
      componentDidMount() {
       // listens for updates in the collection
				this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);

      // listen to authentication events
      this.authUnsubscribe = firebase
        .auth()
        .onAuthStateChanged(async user => {
          if (!user) {
            return await firebase.auth().signInAnonymously();
          }

          // update user state with currently active data
          this.setState({
            uid: user.uid,
            messages: [],
            user: {
              _id: user.uid,
              name: name,
              avatar: 'https://placeimg.com/140/140/any',
            },
          });

          //referencing messages of current user
          this.refMsgsUser = firebase
            .firestore()
            .collection('messages')
            .where('uid', '==', this.state.uid);
        });
      // save messages locally to AsyncStorage
      this.saveMessages();
    }
      


       componentWillUnmount() {
        this.unsubscribe();
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
            user: {
              _id: data.user._id,
              name: data.user.name,
              avatar: data.user.avatar,
            },
          });
        });
        this.setState({
          messages: messages,
        });
      };

      addMessages(myMessage) {
        const message = myMessage[0]
        
        this.referenceChatMessages.add({
          _id: message._id,
          text: message.text || '',
          createdAt: message.createdAt,
          user: this.state.user,
        });
      }

      
    //save newly added messages to state.messgaes
    async saveMessages() {
      try {
          await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
      } catch (error) {
          console.log(error.message);
      }
  }

      onSend(messages = []) {
        this.setState(
          previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
          }),
          () => {
            this.saveMessages();
            this.addMessages(messages);
          }
        );
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