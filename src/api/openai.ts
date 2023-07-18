import {Message} from '../utils/local-storage';
import Config from 'react-native-config';

// turn the chat function to a promise that returns the response
// write a promise function that will return the response
// export the promise function

export const chat = (messages: Message[]) => {
  return new Promise<{
    response: string;
    promptTokens: number;
    responseTokens: number;
  }>((resolve, reject) => {
    let sendData = {
      model: 'gpt-3.5-turbo',
      messages: messages.map(message => ({
        content: message.content,
        role: message.role,
      })),
      temperature: 0.7,
    };

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Config.OPENAI_API_KEY,
      },
      body: JSON.stringify(sendData),
    })
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data));
        resolve({
          response: data.choices[0].message.content,
          promptTokens: data.usage.prompt_tokens,
          responseTokens: data.usage.completion_tokens,
        });
      })
      .catch(error => {
        console.error('Error:', error);
        reject(error);
      });
  });
};
