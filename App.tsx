import { ApplicationProvider } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native';
import * as eva from '@eva-design/eva';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './Screens/Home';
import Detail from './Screens/Detail';
import { ROUTES } from './config';
import Graphic from './Screens/Graphic';

const Stack = createStackNavigator()

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
              name={ROUTES.list}
              component={Home}
            />
            <Stack.Screen
              name={ROUTES.detail}
              component={Detail}
            />
            <Stack.Screen
              name={ROUTES.graphic}
              component={Graphic}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ApplicationProvider>
  );
}

