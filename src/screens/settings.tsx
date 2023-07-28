import React, {useEffect, useState} from 'react';
import {Text, TextInput, View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  setDontFixGrammerSentence,
  setFixGrammer,
  setFixGrammerSentence,
  setMaxSentences,
  setVoiceId,
} from '../state/config';
import Tts from 'react-native-tts';
import SelectDropdown from 'react-native-select-dropdown';
import ToggleSwitch from 'toggle-switch-react-native';

export const Settings = () => {
  const dispatch = useDispatch();
  const fixGrammerSentence = useSelector(
    state => state.config.fixGrammerSentence,
  );
  const dontFixGrammerSentence = useSelector(
    state => state.config.dontFixGrammerSentence,
  );
  const voiceId = useSelector(state => state.config.voiceId);
  const maxSentences = useSelector(state => state.config.maxSentences);
  const fixGrammer = useSelector(state => state.config.fixGrammer);

  const [voices, setVoices] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    Tts.voices().then(_voices => {
      // console.log(_voices);
      setVoices(
        _voices
          .filter(
            voice => voice.id.substring(0, 26) === 'com.apple.voice.compact.en',
          )
          .map(voice => ({id: voice.id, name: voice.name})),
      );
    });
  }, []);

  return (
    <View style={{flex: 1, padding: 30, backgroundColor: 'white'}}>
      <ToggleSwitch
        isOn={fixGrammer}
        onColor="blue"
        offColor="grey"
        label="Fix grammer"
        labelStyle={{fontSize: 18}}
        size="medium"
        onToggle={val => {
          dispatch(setFixGrammer(val));
        }}
      />
      <View style={{marginTop: 10, flexDirection: 'row', alignItems: 'center'}}>
        <Text>Yes: </Text>
        <TextInput
          value={fixGrammerSentence}
          onChangeText={text => {
            dispatch(setFixGrammerSentence(text));
          }}
          style={styles.input}
        />
      </View>
      <View style={{marginTop: 10, flexDirection: 'row', alignItems: 'center'}}>
        <Text>No:{'  '}</Text>
        <TextInput
          value={dontFixGrammerSentence}
          onChangeText={text => {
            dispatch(setDontFixGrammerSentence(text));
          }}
          style={styles.input}
        />
      </View>
      <Text style={{marginTop: 50, fontSize: 18}}>Voice:</Text>
      <SelectDropdown
        data={voices.map(voice => voice.name)}
        onSelect={(selectedItem, index) => {
          dispatch(setVoiceId(voices[index].id));
        }}
        defaultValueByIndex={voices.findIndex(voice => voice.id === voiceId)}
      />
      <Text style={{marginTop: 50, fontSize: 18}}>Max sentences:</Text>
      <SelectDropdown
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        onSelect={selectedItem => {
          dispatch(setMaxSentences(selectedItem));
        }}
        defaultValue={maxSentences}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F4F6F7',
    padding: 5,
    width: 200,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
  },
});
