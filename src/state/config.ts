import AsyncStorage from '@react-native-async-storage/async-storage';
import {AtomEffect, DefaultValue, atom} from 'recoil';

function persistAtom<T>(key: string): AtomEffect<T> {
  return ({setSelf, onSet}) => {
    setSelf(
      AsyncStorage.getItem(key).then(
        savedValue =>
          savedValue != null ? JSON.parse(savedValue) : new DefaultValue(), // Abort initialization if no value was stored
      ),
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _, isReset) => {
      isReset
        ? AsyncStorage.removeItem(key)
        : AsyncStorage.setItem(key, JSON.stringify(newValue));
    });
  };
}

export const voiceIdState = atom({
  key: 'VoiceID',
  default: '',
  effects_UNSTABLE: [persistAtom('config-state-voice-id')],
});

export const maxSentencesState = atom({
  key: 'MaxSentences',
  default: 5,
  effects_UNSTABLE: [persistAtom('config-state-max-sentences')],
});

export const fixGrammerState = atom({
  key: 'FixGrammer',
  default: true,
  effects_UNSTABLE: [persistAtom('config-state-fix-grammer')],
});
