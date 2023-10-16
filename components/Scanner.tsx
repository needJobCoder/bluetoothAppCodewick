import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  TouchableOpacity,
  NativeModules,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import { NativeAppEventEmitter } from 'react-native';

import BluetoothStateManager from 'react-native-bluetooth-state-manager';

function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [discovereBluetoothDeivces, setDiscoveredBluetoothDevices] =
    useState<Array>([]);
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
        BleManager.start({ showAlert: true }).then(() => {
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
    console.log('bleStarted ' + bleStarted);
    if (bleStarted) {
      BleManager.start({ showAlert: true });
      BleManager.enableBluetooth().then(() => {
        console.log('BluetoothEnabled');
      });
      BleManager.scan([], 180, true, JSON)
        .then(results => {
          console.log('Scan started');
          setIsScanning(true);
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const getPeripherals = () => {
    BleManager.getDiscoveredPeripherals([]).then(peripheralsArray => {
      // Success code
      console.log('Discovered peripherals: ' + peripheralsArray);
      setDiscoveredBluetoothDevices(peripheralsArray);
      peripheralsArray.map((value, idx) => {
        console.log(value);
      });
    });
  };
  const stopScanning = () => {
    BleManager.stopScan().then(() => {
      // Success code
      console.log('Scan stopped');
      setIsScanning(false);
    });
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const ReturnDiscoveredDevices = () => {
    // eslint-disable-next-line react/no-unstable-nested-components
    const RenderConnectOrDisconnect = ({ item }) => {
      const [isConnected, setIsConnected] = useState(false);
      if (isConnected) {
        return (
          <TouchableOpacity
            style={{ width: '60%', textAlign: 'center' }}
            onPress={() => {
              console.log(isConnected);
              console.log(item.id);
              
              BleManager.disconnect(item.id)
                .then(() => {
                  // Success code
                  console.log("Disconnected");
                  setIsConnected(false);
                })
                .catch((error) => {
                  // Failure code
                  console.log(error);
                })

            }}>
            <Text style={{ ...styles.buttonText, height: 40, }}>Disconnect</Text>
          </TouchableOpacity>
        );
      } else if (!isConnected) {
        return (
          <TouchableOpacity
            style={{ width: '60%', textAlign: 'center' }}
            onPress={() => {
              console.log(isConnected);
              console.log(item.id);
              


              BleManager.connect(item.id)
                .then(() => {
                  // Success code
                  console.log('Connected');
                  setIsConnected(true);
                })
                .catch(error => {
                  // Failure code
                  console.log(error);
                });
              ;
            }}>
            <Text style={{ ...styles.buttonText, height: 40, backgroundColor: 'green' }}>Connect</Text>
          </TouchableOpacity>
        )
      }
    };

    if (discovereBluetoothDeivces.length < 1) {
      return (
        <TouchableOpacity>
          <Text>Please Start Scanning </Text>
        </TouchableOpacity>
      );
    } else if (discovereBluetoothDeivces.length >= 1) {
      const renderItem = ({ item }) => {
        return (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              margin: 4,
              padding: 2,
              height: 80,
            }}>
            <TouchableOpacity style={{ width: '40%' }}>
              <Text>{item.id}</Text>
            </TouchableOpacity>
            <RenderConnectOrDisconnect item={item} />
          </View>
        );
      };

      return (
        <FlatList
          style={{ borderColor: 'black', width: '100%' }}
          data={discovereBluetoothDeivces}
          renderItem={renderItem}
        />
      );
    }
  };

  const RenderScanningStatus = () => {
    if (isScanning) {
      return (
        <TouchableOpacity>
          <Text>Scanning ! Please wait a moment. It takes time</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity>
          <Text>Not Scanning</Text>
        </TouchableOpacity>
      );
    }
  };

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
        <View style={{ justifyContent: 'center', alignContent: 'center' }}>
          <View
            style={{
              height: '50%',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 10,
            }}>
            <TouchableOpacity
              style={{
                width: '100%',
                alignContent: 'center',
                justifyContent: 'center',
              }}
              onPress={async () => {
                const ifPermission = await getPermission();
                console.log(ifPermission);
              }}>
              <Text
                style={{
                  color: 'blue',
                  ...styles.buttonText,
                  marginHorizontal: 'auto',
                  height: 50,
                }}>
                Get Permissions
              </Text>
            </TouchableOpacity>
            <ReturnPermissionAccquired />
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => {
                  scanForDevices();
                }}>
                <Text style={{ color: 'red', ...styles.buttonTextWithMargin }}>
                  Scan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ color: 'red' }}
                onPress={() => {
                  stopScanning();
                }}>
                <Text style={styles.buttonTextWithMargin}>StopScan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                getPeripherals();
              }}>
              <Text style={{ color: 'red' , ...styles.buttonTextWithMargin}}>getPeripherals</Text>
            </TouchableOpacity>
            <RenderScanningStatus />
          </View>
          <View
            style={{
              overflow: 'scroll',
              height: '40%',
              alignContent: 'center',
            }}>
            <ReturnDiscoveredDevices />
          </View>
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

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'blue',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonTextWithMargin: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'blue',
    textAlign: 'center',
    textAlignVertical: 'center',
    margin: 8,
    height: 40,
    width: 120,
  },
});

export default Scanner;
