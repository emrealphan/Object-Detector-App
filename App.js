import React, {useState} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Alert,
} from 'react-native';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
const screen = Dimensions.get('screen');

const App = () => {
  const visionKey = 'AIzaSyDQnsDwz6OYaDlWxdFu4gywE0eHNgIa9v4';

  const [filePath, setFilePath] = useState({});
  const [resimUrl, setResimUrl] = useState({});
  const [resimUri, setResimUri] = useState({});
  const [googleResponse, setGoogleResponse] = useState({});
  function retriveImageFromStorage(imageName) {
    let imageRef = storage().ref('/' + imageName);
    imageRef
      .getDownloadURL()
      .then((url) => {
        setResimUrl(url);
        console.log('Resim firebaseden alındı!');
      })
      .catch((e) => console.log('Resim alma hatası: ', e));
  }

  function _maybeRender(response) {
    if (response == undefined) {
      return false;
    } else {
      return true;
    }
  }
  function fotoYollaFirebase(path, imageName) {
    let reference = storage().ref(imageName);
    let task = reference.putFile(path);
    console.log(path);
    task
      .then(() => {
        console.log('Resim firebase yüklendi.');
      })
      .catch((e) => {
        console.log('Resim firebase yüklenirken hata: ', e);
      });
  }

  const kameraIzinBekle = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Kamera Erişimi',
            message: 'Bu uygulama kamerana erişmek istiyor.',
          },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const galeriIzinBekle = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Galeri Erişimi',
            message: 'Bu uygulama galeriye erişmek istiyor',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Foto yazma hatası', err);
      }
      return false;
    } else return true;
  };

  const fotoCek = async (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      videoQuality: 'low',
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: true,
    };
    let varMiKamera = await kameraIzinBekle();
    let varMiGaleri = await galeriIzinBekle();
    if (varMiKamera && varMiGaleri) {
      launchCamera(options, (response) => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Kamera çalışmıyor');
          return;
        } else if (response.errorCode == 'permission') {
          alert('İzin sağlanmadı');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
        setFilePath(response);
        fotoYollaFirebase(response.uri, response.fileName);
      });
    }
  };

  const visionaYolla = async () => {
    setResimUri('gs://object-detector-8d339.appspot.com/' + filePath.fileName);
    try {
      let body = JSON.stringify({
        requests: [
          {
            features: [{type: 'OBJECT_LOCALIZATION', maxResults: 12}],
            image: {
              source: {
                imageUri: resimUri,
              },
            },
          },
        ],
      });
      let response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=' + visionKey,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: body,
        },
      );
      let responseJson = await response.json();

      setGoogleResponse(responseJson);
      if (googleResponse !== undefined) {
        var mydata = googleResponse.responses[0].localizedObjectAnnotations;
        var txt = '';
        let myDict = {};
        for (let i = 0; i < mydata.length; i++) {
          //txt += mydata[i].name + '\n';
          if (mydata[i].name in myDict) {
            myDict[mydata[i].name] = parseInt(myDict[mydata[i].name]) + 1;
          } else {
            myDict[mydata[i].name] = 1;
          }
        }

        txt =
          JSON.stringify(mydata, null, '\t') +
          '\n' +
          JSON.stringify(myDict, null, '\n');

        Alert.alert('VISION API', txt);
      }
    } catch (error) {
      console.log('');
    }
  };

  const galeridenSec = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Kamera çalışmıyor');
        return;
      } else if (response.errorCode == 'permission') {
        alert('İzin sağlanmadı');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      setFilePath(response);
      fotoYollaFirebase(response.uri, response.fileName);
    });
  };

  return (
    <SafeAreaView style={{flex: screen.height, backgroundColor: '#fff'}}>
      <Text style={styles.baslik}>objectdetector</Text>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => fotoCek('photo')}>
          <Text style={styles.yazi}>KAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => galeridenSec('photo')}>
          <Text style={styles.yazi}>GALERİ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => visionaYolla()}>
          <Text style={styles.yazi}>ÇALIŞTIR</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container2}>
        <Image source={{uri: filePath.uri}} style={styles.imageStyle} />
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: screen.height / 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  container2: {
    alignItems: 'center',
    flex: screen.height,
    paddingTop: 15,
  },
  baslik: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingVertical: 20,
  },
  yazi: {
    fontSize: 18,
    color: '#147EFB',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 10,
    width: screen.width / 3,
  },
  imageStyle: {
    width: 300,
    height: 400,
    margin: 5,
  },
});
