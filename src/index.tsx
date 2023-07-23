import React from 'react';
import {RecoilRoot} from 'recoil';

import {Main} from './screens/main';
import {Text, View} from 'react-native';

const App = () => {
  return (
    <React.StrictMode>
      <React.Suspense
        fallback={
          <View>
            <Text>Loading</Text>
          </View>
        }>
        <RecoilRoot>
          <Main />
        </RecoilRoot>
      </React.Suspense>
    </React.StrictMode>
  );
};
export default App;
