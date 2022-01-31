import React from 'react';
import { View, Text, Button, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { ImageBackground } from 'react-native-web';
import { Bubble, GiftedChat, SystemMessage, InputToolbar} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';

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
      }
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
      if (connection.isConnected) {
        console.log('online');
      } else {
        console.log('offline');
      }
    });

    this.getMessages();
  }

 
    // stop listening to auth and collection changes
  componentWillUnmount() {
		this.authUnsubscribe();
		this.unsubscribe();
	}

  // stores and adds new messages to database
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.saveMessages();
    });
  }

  // allows user to see new messages when database updates
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each doc
    querySnapshot.forEach((doc) => {
      // get the docs data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages: messages
    });
  }

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
                renderActions={this.renderCustomActions(this)}
                renderActions={this.renderCustomActions(this)}
                    renderCustomView={this.renderCustomView(this)}
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