import React from 'react';
import {Provider} from 'react-redux';
import KeepAwake from 'react-native-keep-awake';

import {RootNavigator} from './navigators/root';
import store from './state/store';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';

let persistor = persistStore(store);

const App = () => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RootNavigator />
          <KeepAwake />
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
};
export default App;
