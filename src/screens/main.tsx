import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import {GiftedChat} from 'react-native-gifted-chat';
import {useHeaderHeight} from '@react-navigation/elements';

import {chat} from '../api/openai';

import {useSelector} from 'react-redux';

type Message = {
  role: 'user' | 'system';
  content: string;
  promptTokens: number;
  responseTokens: number;
  createdAt: Date;
};

export const Main = () => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const [upperAreaHeight, setUpperAreaHeight] = useState(0);

  // 0-waiting, 1-sending, 2-talking, 3-recording
  const [status, setStatus] = useState(0);
  const [conversation, setConversation] = useState<Message[]>([]);
  const voiceId = useSelector(state => state.config.voiceId);
  const maxSentences = useSelector(state => state.config.maxSentences);
  const fixGrammer = useSelector(state => state.config.fixGrammer);
  const fixGrammerSentence = useSelector(
    state => state.config.fixGrammerSentence,
  );
  const dontFixGrammerSentence = useSelector(
    state => state.config.dontFixGrammerSentence,
  );
  const [reply, setReply] = useState('');

  Tts.setDefaultLanguage('en-US');
  // Initialize Voice module on component mount
  useEffect(() => {
    // Tts.addEventListener('tts-start', () => {});
    // Tts.addEventListener('tts-cancel', () => {});
    // Tts.addEventListener('tts-progress', () => {});
    const finishEvent = Tts.addEventListener('tts-finish', event => {
      setStatus(3);
    });

    Voice.onSpeechResults = _onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      finishEvent.remove();
    };
  }, []);

  useEffect(() => {
    if (status === 3) {
      startRecording();
    }
  }, [status]);

  useEffect(() => {
    if (reply !== '') {
      sendReply(reply);
    }
  }, [reply]);

  const speak = (text: string) => {
    Tts.stop();
    Tts.speak(text, {
      iosVoiceId: voiceId!,
      rate: 0.5,
      androidParams: {
        KEY_PARAM_PAN: -1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
    setStatus(2);
  };

  const sendReply = async (text: string) => {
    setStatus(1);
    const newConversation: Message[] = [
      ...conversation,
      {
        role: 'user',
        content: `${text}. dont use more than ${maxSentences} sentences.${
          fixGrammer ? fixGrammerSentence : dontFixGrammerSentence
        }`,
        promptTokens: 0,
        responseTokens: 0,
        createdAt: new Date(),
      },
    ];
    setConversation(newConversation);

    chat(newConversation)
      .then(({response, promptTokens, responseTokens}) => {
        setConversation([
          ...newConversation,
          {
            role: 'system',
            content: response,
            promptTokens,
            responseTokens,
            createdAt: new Date(),
          },
        ]);
        speak(response);
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

  const handleStart = () => {
    speak('how can I help you?');
    setConversation([
      {
        role: 'system',
        content: 'how can I help you?',
        promptTokens: 0,
        responseTokens: 0,
        createdAt: new Date(),
      },
    ]);
  };

  const handleStop = () => {
    Tts.stop();
    // setStatus(3);
  };

  return (
    <View style={{backgroundColor: 'white', alignItems: 'center', flex: 1}}>
      <View
        style={{alignItems: 'center'}}
        onLayout={e => {
          setUpperAreaHeight(e.nativeEvent.layout.height);
        }}>
        <Text style={{fontSize: 20, marginTop: 20}}>
          {['waiting...', 'sending...', 'talking', 'recording'][status]}
        </Text>
        <TouchableOpacity
          onPress={status === 0 ? handleStart : handleStop}
          disabled={status === 1 || status === 3}>
          <View
            style={[
              styles.button,
              status === 1 || status === 3 ? styles.disabledButton : undefined,
              {marginTop: 20},
            ]}>
            <Text style={styles.text}>{status === 0 ? 'Start' : 'Stop'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{marginTop: 20}}>
          {/* display the summary of all conversation messages promptTokens */}
          <Text>
            prompt tokens:
            {conversation
              .map(message => message.promptTokens)
              .reduce((a, b) => a + b, 0)}{' '}
            - $
            {(
              (0.0015 *
                conversation
                  .map(message => message.promptTokens)
                  .reduce((a, b) => a + b, 0)) /
              1000
            ).toFixed(4)}
          </Text>
          <Text>
            response tokens:
            {conversation
              .map(message => message.responseTokens)
              .reduce((a, b) => a + b, 0)}{' '}
            - ${' '}
            {(
              (0.002 *
                conversation
                  .map(message => message.responseTokens)
                  .reduce((a, b) => a + b, 0)) /
              1000
            ).toFixed(4)}
          </Text>
          <Text>
            Total: $
            {(
              (0.0015 *
                conversation
                  .map(message => message.promptTokens)
                  .reduce((a, b) => a + b, 0)) /
                1000 +
              (0.002 *
                conversation
                  .map(message => message.responseTokens)
                  .reduce((a, b) => a + b, 0)) /
                1000
            ).toFixed(4)}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 20,
          width: screenWidth - 16,
          height: screenHeight - upperAreaHeight - headerHeight - 50,
          borderWidth: 1,
          borderRadius: 8,
        }}>
        <GiftedChat
          messages={conversation.reverse().map((message, index) => ({
            _id: index,
            text: message.content,
            createdAt: message.createdAt,
            user:
              message.role === 'user'
                ? {
                    _id: 1,
                    name: 'Me',
                    avatar: 'https://placeimg.com/140/140/any',
                  }
                : {
                    _id: 2,
                    name: 'System',
                    avatar: 'https://placeimg.com/140/140/any',
                    system: true,
                  },
          }))}
          // onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderInputToolbar={() => null}
          renderAvatar={() => null}
        />
      </View>
    </View>
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
  disabledButton: {backgroundColor: 'grey'},
  text: {color: 'white', fontSize: 20, fontWeight: 'bold'},
});
