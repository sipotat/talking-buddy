import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import SelectDropdown from 'react-native-select-dropdown';
import ToggleSwitch from 'toggle-switch-react-native';
import KeepAwake from 'react-native-keep-awake';

import {chat} from '../api/openai';
import {Message} from '../utils/local-storage';
import {useRecoilState} from 'recoil';
import {
  fixGrammerState,
  maxSentencesState,
  voiceIdState,
} from '../state/config';

export const Main = () => {
  // 0-waiting, 1-sending, 2-talking, 3-recording
  const [status, setStatus] = useState(0);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [voices, setVoices] = useState<{id: string; name: string}[]>([]);
  const [voiceId, setVoiceId] = useRecoilState(voiceIdState);
  const [maxSentences, setMaxSentences] = useRecoilState(maxSentencesState);
  const [fixGrammer, setfixGrammer] = useRecoilState(fixGrammerState);

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

    Tts.voices().then(voices =>
      setVoices(
        voices
          .filter(
            voice => voice.id.substring(0, 26) === 'com.apple.voice.compact.en',
          )
          .map(voice => ({id: voice.id, name: voice.name})),
      ),
    );

    Voice.onSpeechResults = _onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      finishEvent.remove();
    };
  }, []);

  useEffect(() => {
    if (voiceId === '') {
      setVoiceId(voices[0].id);
    }
  }, [voiceId]);

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
        content: `${text}. dont use more than ${maxSentences} sentences. ${
          fixGrammer ? 'fix' : 'dont fix'
        } grammer.`,
        promptTokens: 0,
        responseTokens: 0,
      },
    ];
    setConversation(newConversation);

    chat(newConversation)
      .then(({response, promptTokens, responseTokens}) => {
        setConversation([
          ...newConversation,
          {role: 'system', content: response, promptTokens, responseTokens},
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
      console.log('record');
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
      },
    ]);
  };

  const handleStop = () => {
    Tts.stop();
    // setStatus(3);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
        <Text style={{fontSize: 20}}>
          {['waiting...', 'sending...', 'talking', 'recording'][status]}
        </Text>
        <TouchableOpacity
          onPress={status === 0 ? handleStart : handleStop}
          disabled={status === 1 || status === 3}>
          <View
            style={[
              styles.button,
              status === 1 || status === 3 ? styles.disabledButton : undefined,
              {marginTop: 40},
            ]}>
            <Text style={styles.text}>{status === 0 ? 'Start' : 'Stop'}</Text>
          </View>
        </TouchableOpacity>
        <View style={{marginTop: 50}}>
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
          <Text style={{marginTop: 50, fontSize: 18}}>Voice:</Text>
          <SelectDropdown
            data={voices.map(voice => voice.name)}
            onSelect={(selectedItem, index) => {
              setVoiceId(voices[index].id);
              //   Tts.stop();
              //   Tts.speak(
              //     `Hello, my name is ${voices[index].name} and this is my voice`,
              //     {
              //       iosVoiceId: voices[index].id,
              //       rate: 0.5,
              //       androidParams: {
              //         KEY_PARAM_PAN: -1,
              //         KEY_PARAM_VOLUME: 0.5,
              //         KEY_PARAM_STREAM: 'STREAM_MUSIC',
              //       },
              //     },
              //   );
            }}
            defaultValueByIndex={voices.findIndex(
              voice => voice.id === voiceId,
            )}
          />
          <Text style={{marginTop: 50, fontSize: 18}}>Max sentences:</Text>
          <SelectDropdown
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            onSelect={selectedItem => {
              setMaxSentences(selectedItem);
            }}
            defaultValue={maxSentences}
          />
          <View style={{marginTop: 50}}>
            <ToggleSwitch
              isOn={fixGrammer}
              onColor="blue"
              offColor="grey"
              label="Fix grammer"
              labelStyle={{fontSize: 18}}
              size="large"
              onToggle={setfixGrammer}
            />
          </View>
        </View>
      </SafeAreaView>
      <KeepAwake />
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
  disabledButton: {backgroundColor: 'grey'},
  text: {color: 'white', fontSize: 20, fontWeight: 'bold'},
});
