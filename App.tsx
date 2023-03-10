import { ApplicationProvider } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native';
import * as eva from '@eva-design/eva';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './Screens/Home';
import Detail from './Screens/Detail';
import ItemModal from './Components/ItemModal';

const Stack = createStackNavigator()

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
              name='Home'
              component={Home}
            />
            <Stack.Screen
              name='Detail'
              component={Detail}
            />
            <Stack.Screen
              name='NewItem'
              component={ItemModal}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ApplicationProvider>
  );
}

