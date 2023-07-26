import {createSlice} from '@reduxjs/toolkit';

export const configSlice = createSlice({
  name: 'config',
  initialState: {
    voiceId: 'com.apple.voice.compact.en-AU.Karen',
    maxSentences: 5,
    fixGrammer: true,
    fixGrammerSentence: 'fix my grammer',
    dontFixGrammerSentence: "don't fix my grammer",
  },
  reducers: {
    setVoiceId: (state, action) => {
      state.voiceId = action.payload;
    },
    setMaxSentences: (state, action) => {
      state.maxSentences = action.payload;
    },
    setFixGrammer: (state, action) => {
      state.fixGrammer = action.payload;
    },
    setFixGrammerSentence: (state, action) => {
      state.fixGrammerSentence = action.payload;
    },
    setDontFixGrammerSentence: (state, action) => {
      state.dontFixGrammerSentence = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setVoiceId,
  setMaxSentences,
  setFixGrammer,
  setFixGrammerSentence,
  setDontFixGrammerSentence,
} = configSlice.actions;

export default configSlice.reducer;
