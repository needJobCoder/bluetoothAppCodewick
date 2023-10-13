import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  TouchableOpacity,
  NativeModules,
  Alert,
} from 'react-native';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import { NativeAppEventEmitter } from 'react-native'


import BluetoothStateManager from 'react-native-bluetooth-state-manager';

function App() {
  const [discovereBluetoothDeivces, setDiscoveredBluetoothDevices] = useState<Array>([]);
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] =
    useState(false);
  const [bleStarted, setBleStarted] = useState(false);
  const [checkIfBluetoothIsTurnedOn, setCheckIfBluetoothIsTurnedOn] =
    useState(false);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      },
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      },
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      },
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      fineLocationPermission === 'granted'
    );
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      const bluetoothPermission: boolean = await requestAndroid31Permissions();
      if (bluetoothPermission && checkIfBluetoothIsTurnedOn) {
        console.log('bluetoothPermissionAccquired');
        setBluetoothPermissionGranted(true);
        startBleManager(bluetoothPermission);
        return bluetoothPermission;
      }
    } else {
      console.log('permissionNotAccquired');
      return false;
    }
  };
  const ReturnPermissionAccquired = () => {
    if (bluetoothPermissionGranted) {
      return <Text>bluetoothPermissionGranted</Text>;
    } else if (!bluetoothPermissionGranted) {
      return <Text>!bluetoothPermissionGranted</Text>;
    }
  };

  const startBleManager = async (_bluetoothPermissions: boolean) => {
    try {
      if (_bluetoothPermissions) {
        BleManager.start({showAlert: true}).then(() => {
          console.log('Module initialized');
          setBleStarted(true);
        });
      } else if (!_bluetoothPermissions) {
        console.log('problemWith' + `"${'startBleManager'}"` + ' function');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const scanForDevices = () => {
    console.log("bleStarted " + bleStarted);
    if (bleStarted) {

    BleManager.start({showAlert: true});
    BleManager.enableBluetooth().then(()=>{
      console.log("BluetoothEnabled");
      
    })
    BleManager.scan([], 180, true, JSON).then((results) => {
        console.log('Scan started');
        
            
        })
        .catch(error => {
        console.log(error);
      })
    }    

    
  };

  const getPeripherals = ()=>{
    BleManager.getDiscoveredPeripherals([]).then((peripheralsArray) => {
      // Success code
      console.log("Discovered peripherals: " + peripheralsArray);
      peripheralsArray.map((value, idx)=>{
        console.log(value);
        
      })
    });
  }
  const stopScanning = ()=>{
    BleManager.stopScan().then(() => {
      // Success code
      console.log("Scan stopped");
    });
  }

  const dynamicallyCheckBluetoothState = () => {
    BluetoothStateManager.onStateChange(bluetoothState => {
      if (bluetoothState === 'PoweredOn') {
        setCheckIfBluetoothIsTurnedOn(true);
        console.log('checkIfBluetoothIsTurnedOn ' + checkIfBluetoothIsTurnedOn);
      } else {
        setCheckIfBluetoothIsTurnedOn(false);
        console.log('checkIfBluetoothIsTurnedOn ' + checkIfBluetoothIsTurnedOn);
      }
    }, true /*=emitCurrentState*/);
  };

  useEffect(() => {
    console.log('bluetoothPermissionGranted' + bluetoothPermissionGranted);
    dynamicallyCheckBluetoothState();
  }, []);

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderApp = () => {
    if (checkIfBluetoothIsTurnedOn) {
      return (
        <View
          style={{
            flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={async () => {
              const ifPermission = await getPermission();
              console.log(ifPermission);
            }}>
            <Text style={{color: 'blue'}}>Get Permissions</Text>
          </TouchableOpacity>
          <ReturnPermissionAccquired />
          <TouchableOpacity onPress={()=>{
            scanForDevices();
          }}>
          <Text style={{color:'red'}} >Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{color:'red'}} onPress={()=>{stopScanning()}}>
            <Text>StopScan</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{
            getPeripherals();
          }} >
            <Text style={{color: 'red'}}>getPeripherals</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>TurnOnBluetooth</Text>
        </View>
      );
    }
  };

  return <RenderApp />;
}

export default App;
