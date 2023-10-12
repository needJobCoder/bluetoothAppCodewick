import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';

function App() {
  const [bluetoothPermissionGranted, setBluetoothPermissionGranted] =
    useState(false);
  const [bleStarted, setBleStarted] = useState(false);
  const [checkIfBluetoothIsTurnedOn, setCheckIfBluetoothIsTurnedOn] = useState(false);

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
      if (bluetoothPermission) {
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
    if (bleStarted) {
      BleManager.scan([], 5, true).then(() => {
        // Success code
        console.log('Scan started');
      });
    }
  };
  useEffect(() => {
    console.log('bluetoothPermissionGranted' + bluetoothPermissionGranted);
    
  }, [bluetoothPermissionGranted]);

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
          console.log(await getPermission());
        }}>
        <Text style={{color: 'blue'}}>Connect To Bluetooth</Text>
      </TouchableOpacity>
      <ReturnPermissionAccquired />
    </View>
  );
}

export default App;
