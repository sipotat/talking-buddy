import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import {chat} from './api/openai';
import {Message, retrieveChat, storeChat} from './utils/local-storage';
import introText from './utils/intro-text';

const App = () => {
  // 0-waiting, 1-sending, 2-talking, 3-recording
  const [status, setStatus] = useState(0);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [reply, setReply] = useState('');

  Tts.setDefaultLanguage('en-IE');

  //   Tts.setDefaultVoice('com.apple.ttsbundle.Yuna-compact');

  useEffect(() => {
    storeChat(conversation);
  }, [conversation]);

  useEffect(() => {
    console.log('STATUS', status);
    if (status === 3) {
      startRecording();
    }
  }, [status]);

  useEffect(() => {
    if (reply !== '') {
      sendReply(reply);
    }
  }, [reply]);

  // Initialize Voice module on component mount
  useEffect(() => {
    // Tts.addEventListener('tts-start', () => {});
    // Tts.addEventListener('tts-cancel', () => {});
    // Tts.addEventListener('tts-progress', () => {});
    const finishEvent = Tts.addEventListener('tts-finish', event => {
      console.log("I'm done", event);
      setStatus(3);
    });

    Voice.onSpeechResults = _onSpeechResults;
    retrieveChat().then(data => {
      setConversation(data);
    });
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      finishEvent.remove();
    };
  }, []);

  const sendReply = async (text: string) => {
    setStatus(1);
    const newConversation: Message[] = [
      ...conversation,
      {role: 'user', content: text, promptTokens: 0, responseTokens: 0},
    ];
    setConversation(newConversation);

    chat(newConversation)
      .then(({response, promptTokens, responseTokens}) => {
        setConversation([
          ...newConversation,
          {role: 'system', content: response, promptTokens, responseTokens},
        ]);
        console.log([...newConversation, {role: 'system', content: response}]);
        console.log('response', response);
        Tts.stop();
        Tts.speak(response);
        setStatus(2);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const _onSpeechResults = e => {
    e.value && console.log(e.value[0]);
    if (e.value && e.value[0].substring(e.value[0].length - 4) === 'stop') {
      Voice.cancel();
      setReply(e.value[0].substring(0, e.value[0].length - 4));
    }
  };

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    if (status === 0) {
      if (conversation.length === 0) {
        sendReply(introText);
      }
    }
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
        <Text style={{fontSize: 20}}>
          {['waiting...', 'sending...', 'talking', 'recording'][status]}
        </Text>
        <TouchableOpacity onPress={handleStart}>
          <View style={[styles.button, {marginTop: 40}]}>
            <Text style={styles.text}>{status === 0 ? 'Start' : 'Stop'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{marginTop: 50}}>
          {/* display the summary of all conversation messages promptTokens */}
          <Text>
            prompt tokens:
            {conversation
              .map(message => message.promptTokens)
              .reduce((a, b) => a + b, 0)}
          </Text>
          <Text>
            response tokens:
            {conversation
              .map(message => message.responseTokens)
              .reduce((a, b) => a + b, 0)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setConversation([]);
            setStatus(0);
          }}>
          <View style={[styles.button, {marginTop: 50}]}>
            <Text style={styles.text}>Clear</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 150,
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: 'blue',
  },
  text: {color: 'white', fontSize: 20, fontWeight: 'bold'},
});

export default App;
