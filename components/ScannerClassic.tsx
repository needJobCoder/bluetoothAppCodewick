/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, LogBox } from 'react-native';
import { styles } from './Scanner';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';

import BluetoothStateManager from 'react-native-bluetooth-state-manager';

import { PermissionsAndroid } from 'react-native';

import { GlobalContext } from '../App';
import { requestAndroid31Permissions } from './Scanner';

function ScannerClassic() {
  const returnSelectedStatusRef = useRef();
  const [isScanningForBluetoothDevices, setIsScanningForBluetoothDevices] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any | Array>([]);
  const [selectedDevice, useSelectedDevice] = useState<string>(undefined);
  const { selectedDeviceForSendingData, setSelectedDeviceForSendingData } = useContext(GlobalContext);
  const ifBluetoothAvailable = async () => {
    try {
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      console.log(available);
      return available;
    } catch (err) {
      console.log(err);
    }
  };

  const RenderSelectedDevice = ()=>{

    if(typeof selectedDeviceForSendingData === 'undefined')
    {
      console.log("selectedDeviceIsUndefined");
      return <Text style={{...scannerClassicStyles.globalTextColor}}>Selected Device : None</Text>
    }
    else
    {
      return <Text style={{...scannerClassicStyles.globalTextColor}} onPress={()=>{
        console.log(selectedDeviceForSendingData.name);
        
      }}>Selected Device : {selectedDeviceForSendingData.name},  {selectedDeviceForSendingData.address} is connected ! No need to reconnect</Text>
    }
  }

  const ifBluetoothEnabled = async () => {
    try {
      const ifEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBluetoothEnabled(ifEnabled);
    } catch (err) {
      console.log(err);
    }
  };

  const requestAccessFineLocationPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Access fine location required for discovery',
        message:
          'In order to perform discovery, you must enable/allow ' +
          'fine location access.',
        buttonNeutral: 'Ask Me Later"',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };
  const startBluetoothDiscovery = async () => {
    try {
      if (await requestAccessFineLocationPermission()) {
        console.log("requestAccessFineLocationPermission ", await requestAccessFineLocationPermission());
        try {
          const DiscoveredDevices = await RNBluetoothClassic.startDiscovery();
          console.log("unpairedDiscoveryDevices" + DiscoveredDevices);
          if (DiscoveredDevices) {
            setIsScanningForBluetoothDevices(true);
            setDiscoveredDevices(DiscoveredDevices);
          }

        }
        catch (err) {
          console.log(err);

        }

      }
    } catch (err) {
      console.log(err);
    }
  };

  



  const cancelDiscovery = async () => {
    console.log('attemptedCancellingDiscoveryBluetoothClassicDevices');

    try {
      const cancelled = await RNBluetoothClassic.cancelDiscovery();
      console.log(cancelled);
      if (cancelled) {
        setIsScanningForBluetoothDevices(false)
      }
      else if (cancelled) {
        const tryCancelAgain = await RNBluetoothClassic.cancelDiscovery();
        console.log("tryCancelAgain ", tryCancelAgain);

      }

    } catch (error) {
      console.log(error);
    }
  };

  const dynamicallyCheckBluetoothState = () => {
    BluetoothStateManager.onStateChange(bluetoothState => {
      if (bluetoothState === 'PoweredOn') {
        setIsBluetoothEnabled(true);
      } else {
        setIsBluetoothEnabled(false);
      }
    }, true /*=emitCurrentState*/);
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderScaningStatusText = () => {
    if (isScanningForBluetoothDevices) {
      return <Text style={{ ...scannerClassicStyles.globalTextColor }}>Scanning Devices Please Wait !</Text>
    }
    else {
      return <Text style={{ ...scannerClassicStyles.globalTextColor }} >Stopped Scanning ! </Text>
    }
  }

  useEffect(() => {
    dynamicallyCheckBluetoothState();
  }, []);

  // eslint-disable-next-line react/no-unstable-nested-components
  const RenderDiscoverdDevicesFlatlist = () => {
    const RenderConnectOrDisconnectButton = ({ item }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [isDeviceConnected, setIsDeviceConnected] = useState(false);

      if (!isDeviceConnected) {
        return (
          <TouchableOpacity style={{ ...scannerClassicStyles.StopStartScanButtons }} onPress={() => {
            const isConnected = RNBluetoothClassic.pairDevice(item.id)
            console.log(isConnected);

            if (isConnected) {
              setIsDeviceConnected(true)
            }
          }}>
            <Text style={{ ...styles.buttonTextWithMargin }}>Connect</Text>
          </TouchableOpacity>
        )
      }
      else {
        return (
          <View>
            <TouchableOpacity style={{ ...scannerClassicStyles.StopStartScanButtons }}>
              <Text style={{ ...styles.buttonTextWithMargin }}>Disonnect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ ...scannerClassicStyles.StopStartScanButtons }} onPress={() => {
              setSelectedDeviceForSendingData(item);

            }}>
              <Text style={{ ...styles.buttonTextWithMargin }}>Select</Text>

            </TouchableOpacity>
          </View>

        )
      }
    }
    if (discoveredDevices.length === 0) {
      return (
        <View>
          <TouchableOpacity onPress={() => {

          }}>
            <Text style={{ ...scannerClassicStyles.globalTextColor }} onPress={() => {

            }}>No devices discovered</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else if (discoveredDevices.length > 0) {



      const render = ({ item }) => {
        return (
          <View style={{ width: '100%', flexDirection: 'row' }}>
            <View style={{ width: '60%' }}>
              <Text style={{ ...scannerClassicStyles.globalTextColor, marginHorizontal: 2, textAlignVertical: 'center' }}>{item.name}</Text>
              <Text style={{ ...scannerClassicStyles.globalTextColor, marginHorizontal: 2, textAlignVertical: 'center' }}>{item.address}</Text>
            </View>
            <View>
              <RenderConnectOrDisconnectButton item={item} />
            </View>
          </View>
        );

      };

      return (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{ width: '100%', marginTop: 4 }}>
          <FlatList style={{ marginTop: 10, width: '100%', borderWidth: 2 }} renderItem={render} data={discoveredDevices} />
        </View>
      );
    }
  };

  const RenderClassicScanner = () => {
    if (isBluetoothEnabled) {
      return (
        <View>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                ifBluetoothEnabled();
              }}>
              <Text style={{ ...styles.buttonTextWithMargin }}>GetPermissions</Text>
            </TouchableOpacity>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <TouchableOpacity
              style={{ ...scannerClassicStyles.StopStartScanButtons }} onPress={() => {
                requestAndroid31Permissions();
                startBluetoothDiscovery();
              
              }}>
              <Text style={{ ...styles.buttonTextWithMargin, width: '90%' }}>
                StartScan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ ...scannerClassicStyles.StopStartScanButtons }} onPress={() => { cancelDiscovery(); }}>
              <Text style={{ ...styles.buttonTextWithMargin, width: '90%' }}>
                StopScan
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async () => {
            try {
              const available = await RNBluetoothClassic.isBluetoothAvailable();
              console.log("isBluetoothAvaialbe " + available);
            } catch (err) {
              console.log(err);
            }
            try {
              const enabled = await RNBluetoothClassic.isBluetoothEnabled();
              console.log("isBluetoothEnabled", enabled);
            } catch (err) {
              console.log(err)
            }

            console.log(discoveredDevices);

            try {
              const connectedDevices = await RNBluetoothClassic.getConnectedDevices();
              console.log(connectedDevices);

            } catch (err) {
              // Error if Bluetooth is not enabled
              // Or there are any issues requesting paired devices
            }

            try {
              const connected = await RNBluetoothClassic.getConnectedDevices();
              console.log(connected);

            } catch (err) {
              // Error if Bluetooth is not enabled
              // Or there are any issues requesting paired devices
            }
            

          }}>
            <Text style={{ ...scannerClassicStyles.globalTextColor }}>IsBluetoothEnabled</Text>
          </TouchableOpacity>
          <RenderScaningStatusText />
          <RenderSelectedDevice />
          <RenderDiscoverdDevicesFlatlist />


        </View>
      );
    }
    else if (!isBluetoothEnabled) {
      return (
        <View style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', height: '100%', width: '100%' }}>
          <Text style={{ textAlign: 'center' }}>Turn on bluetooth</Text>
        </View>
      );
    }
  };

  return (
    <RenderClassicScanner />
  );
}

const scannerClassicStyles = StyleSheet.create({
  StopStartScanButtons: {
    display: 'flex',
    flexDirection: 'row',
    width: '50%',
  },
  globalTextColor: {
    color: 'black',
  },
});

export default ScannerClassic;
