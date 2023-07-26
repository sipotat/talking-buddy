import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Main} from '../screens/main';
import {Settings} from '../screens/settings';
import {SettingsIcon} from '../ui/icons/settings';
import {TouchableOpacity} from 'react-native';
import {ArrowRight} from '../ui/icons/ArrowRight';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Main}
          options={({navigation}) => ({
            title: 'Talking Buddy',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Settings');
                }}>
                <SettingsIcon />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={({navigation}) => ({
            title: 'Talking Buddy',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}>
                <ArrowRight leftDirection />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
