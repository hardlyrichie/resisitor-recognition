import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image, Platform, Dimensions } from 'react-native';
import { Camera, Permissions, ImageManipulator, FileSystem } from 'expo';

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    image: null,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  async getResistorValue() {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({base64: true});
      console.log(`[PICTURE] Width: ${photo.width} Height: ${photo.height}`); // width: 3456, height: 4608

      const cropDim = 1500

      const croppedImage = await ImageManipulator.manipulateAsync(photo.uri, 
        [{
          resize: {
            width: photo.width,
            height: photo.height
          }
        },{
          crop: {
            originX: photo.width / 2 - (cropDim / 2), 
            originY: photo.height / 2 - (cropDim / 2), 
            width: cropDim, 
            height: cropDim 
          },
        }],
        {
          compress: 1,
          format: 'jpeg'
        }
      );

      // Send image to server
      console.log(croppedImage.uri);

      const filename = croppedImage.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('photo', { uri: croppedImage.uri, name: filename, type});

      try {
        const response = await fetch('https://resistor-sorter.appspot.com/resistor', {
          method: 'POST',
          body: formData,
          header: {
            'content-type': 'multipart/form-data',
          },
        });
        // const value = await response.json();
        if (response.status == 200) {
          console.log(response._bodyText);
        }
      } catch(err) {
        console.log('Error with getting value from server: ' + err);
      }
      
      this.setState({
        image: croppedImage.uri
      });
    }
  }

  // Get ratio of devices camera so display is not distored
  async getRatio() {
    if (Platform.OS === 'android' && this.camera) {
      const ratios = await this.camera.getSupportedRatiosAsync();

      const { height, width } = Dimensions.get('window');
      const phoneRatio = height / width;
      var bestRatio = 0;
      var threshold = 100000;

      // Get best ratio out of those frim getSupportedRatios
      for (ratio in ratios) {
          const r = ratios[ratio].split(":")
          if (Math.abs(phoneRatio - r[0] / r[1]) < threshold) {
              threshold = Math.abs(bestRatio - r[0]/r[1]);
              bestRatio = ratios[ratio];
          }
      }

      this.setState({ ratio: bestRatio });
    }
  }

  render() {
    const { hasCameraPermission, ratio, image } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      let width = height = null;
      if (ratio) {
        width = Dimensions.get('window').width;
        const r = ratio.split(":");
        height = width * r[0] / r[1];
        console.log(`[CAMERA] Width: ${width} Height: ${height}`);
      }
      
      // TODO: Display line up resister here text
      return (
        <View style={{ flex: 1 }}>
          <Camera 
            style={{ width: width, height: height, }}
            zoom={1}
            focusDepth={1}
            ref={ref => { this.camera = ref; }}
            onCameraReady={this.getRatio.bind(this)}
            ratio={ratio}
          >
            <View style={[
              styles.aimLine, 
              {
                width: 100,
                marginLeft: width / 2 - 100 / 2
              }
            ]}></View>

            <View style={{
              flex: 1,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              { image ? <Image style={{ width: 200, height: 200}} source={{uri: image}}/> : null }
              <TouchableHighlight 
                onPress={this.getResistorValue.bind(this)} 
                underlayColor="white" 
                style={styles.button}
              >
                <View>
                  <Text>Capture</Text>
                </View>
              </TouchableHighlight>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 100,
    height: 50,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  aimLine: {
    flex: 1,
    borderBottomWidth: 3,
    borderBottomColor: 'red',
  }
});