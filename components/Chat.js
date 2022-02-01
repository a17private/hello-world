import React from 'react';
import { View, Text, Button, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { ImageBackground } from 'react-native-web';
import { Bubble, GiftedChat, SystemMessage, InputToolbar} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const firebase = require('firebase').default;

// firebase configuration for chat
const firebaseConfig = {
  apiKey: "AIzaSyDfC9rrnsHcbkDYsTvPpyDCPo7MGl3r7K4",
  authDomain: "chatbox-5b469.firebaseapp.com",
  projectId: "chatbox-5b469",
  storageBucket: "chatbox-5b469.appspot.com",
  messagingSenderId: "173037378161",
  appId: "1:173037378161:web:edff3102d7e91115b219d0",
  measurementId: "G-X924KS3LKX"
};

export default class Chat extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: 'Logging in...',
      user: {
        _id: '',
        name: '',
      },
      isConnected: false, 
      image: null,
      location: null
  };
    
  // initializing firebase
    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    // reference to firebase messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // this.referenceMessageUser = null;
  }

  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  componentDidMount() {
    NetInfo.fetch().then(connection => {
      if(connection.isConnected) { // If the user is connected proceed to firebase authentication
        this.setState({ isConnected: true, loggedInText: 'Online' });
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => { // Add a database listener to detect changes in authorization status. Store callback to detach listener in authUnsubscribe property
          if (!user) { await firebase.auth().signInAnonymously() }; // 
          this.setState({
            uid: user.uid,
            user: {
              _id: user.uid,
              name: this.state.name,
              avatar: 'https://placeimg.com/140/140/any'
            }
          });
          // Add a database listener that will retrieve a snapshot of the messages collection whenever a change is detected, and pass it to the onCollectionUpdate function. Store callback to unsubscribe in unsubscribeMessagesCollection object
          this.unsubscribeMessagesCollection = this.messagesCollection.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
        });
      } else {
        this.setState({ isConnected: false });
        this.getMessages(); // If the user is offline get messages from async storage
      }
    });
  }
 
    // stop listening to auth and collection changes
  componentWillUnmount() {
		this.authUnsubscribe();
		this.unsubscribe();
	}


  // Add messages to database
  addMessages() {
    const message = this.state.messages[0];
    // add a new messages to the collection
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || "",
      location: message.location || null,
    });
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

 // custom function for chat message 
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessages();
      this.saveMessages();
    })
  }

   // when updated set the messages state with the current data 
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
                avatar: data.user.avatar
            },
            image: data.image || null,
            location: data.location || null,
        });
    });
this.setState({
messages: messages
});
};

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }


  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }

      //return a MapView when surrentMessage contains location data
      renderCustomView (props) {
        const { currentMessage} = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{width: 150,
                    height: 100,
                    borderRadius: 13,
                    margin: 3}}
                    region={{
                    latitude: currentMessage.location.latitude,
                    longitude: currentMessage.location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }


  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };
  

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#1982FC'
          }
        }}
      />
    )
  }

  render() {
    // pulls background image selection from Start screen
    const { bgImg } = this.props.route.params;

    return (
      <View style={styles.container}>
        <ImageBackground
          source={bgImg}
          resizeMode='cover'
          style={styles.bgImg}>
          <View style={styles.chat}>  
              <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                messages={this.state.messages}
                renderInputToolbar={this.renderInputToolbar.bind(this)}
                renderActions={this.renderCustomActions}
                renderCustomView={this.renderCustomView}
                onSend={messages => this.onSend(messages)}
                user={{
                  _id: 1,
                }}
              />
          </View>  
        </ImageBackground>
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 10,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgImg: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
  chat: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    marginBottom: 8,
  }
});