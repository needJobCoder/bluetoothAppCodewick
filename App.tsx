import React, { useState, useContext, createContext, useRef} from 'react'
import Scanner from './components/Scanner'
import ScannerClassic from './components/ScannerClassic';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

export const GlobalContext = createContext();

function App() {
  const selectedDeviceForSendingDataNoReload = useRef(undefined);
  const [selectedDeviceForSendingData, setSelectedDeviceForSendingData] = useState();
  return (
    <GlobalContext.Provider
      value={{
        selectedDeviceForSendingData,
        setSelectedDeviceForSendingData,
        selectedDeviceForSendingDataNoReload,
      }}>
   <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="BleScanner" component={Scanner} />
      <Tab.Screen name="BluetoothClassicScanner" component={ScannerClassic} />
    </Tab.Navigator>
   </NavigationContainer>
    </GlobalContext.Provider>
  )
}

export default App