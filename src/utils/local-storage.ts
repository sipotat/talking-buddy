import AsyncStorage from '@react-native-async-storage/async-storage';

export type Message = {
  role: string;
  content: string;
  promptTokens: number;
  responseTokens: number;
};

export const storeChat = async (conversation: Message[]) => {
  try {
    await AsyncStorage.setItem('conversation', JSON.stringify(conversation));
  } catch (error) {
    // Error saving data
    console.log('error', error);
  }
};

export const retrieveChat = async () => {
  try {
    const value = await AsyncStorage.getItem('conversation');
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return [];
    }
  } catch (error) {
    console.log('error', error);
  }
};

export const storeVoice = async (voiceId: string) => {
  try {
    await AsyncStorage.setItem('voice', voiceId);
  } catch (error) {
    // Error saving data
    console.log('error', error);
  }
};

export const retrieveVoice = async () => {
  try {
    const value = await AsyncStorage.getItem('voice');
    if (value !== null) {
      return value;
    } else {
      return '';
    }
  } catch (error) {
    console.log('error', error);
  }
};
