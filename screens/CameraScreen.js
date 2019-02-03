import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Alert, Image, Platform, Dimensions } from 'react-native';
import { Camera, Permissions } from 'expo';

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
      let photo = await this.camera.takePictureAsync();
      console.log(`[PICTURE] Width: ${photo.width} Height: ${photo.height}`); // width: 3456, height: 4608
      this.setState({
        image: photo.uri
      });

      // Process images

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