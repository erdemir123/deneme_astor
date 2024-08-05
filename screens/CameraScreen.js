import { CameraView, useCameraPermissions,Camera } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useTicketCalls from '../hooks/useTicketCalls';

export default function CameraScreen({navigation}) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const {getTicketById} =useTicketCalls()

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
console.log(hasPermission)
    getCameraPermissions();
  }, []);
 
  
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return; // Eğer zaten tarandıysa, taramayı durdur
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    //alert(data)
    navigation.navigate("CreateSupport", { data: data })
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  console.log("object",scanned)

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View  className="relative flex-1 justify-center items-center">
      <CameraView className=" w-80 mx-auto h-[460px]  "  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes:  [
            "aztec",
            "ean13",
            "ean8",
            "qr",
            "pdf417",
            "upc_e",
            "datamatrix",
            "code39",
            "code93",
            "itf14",
            "codabar",
            "code128",
            "upc_a"
          ],
        }}>
          
       
      </CameraView>
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} className="absolute bottom-24 left-32 py-2 px-4 bg-red-500 rounded-[4px] ">
          <Text className="text-whitekozy font-semibold text-title-large">Tekrar oku</Text>
        </TouchableOpacity>
       
      )}
    </View>
  );
}


