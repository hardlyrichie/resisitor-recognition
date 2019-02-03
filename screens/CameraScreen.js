import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Image, Platform, Dimensions } from 'react-native';
import { Camera, Permissions, ImageManipulator, FileSystem } from 'expo';

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    image: null,
    value: null
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
      
      // Crop image to zoom in for preview
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

      this.setState({
        image: croppedImage.uri
      });

      // Send image to server
      const filename = photo.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('photo', { uri: photo.uri, name: filename, type});

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
          this.setState({
            value: response._bodyText
          });
        } else {
          console.log('Post request failed');
          console.log(response);
          this.setState({
            value: "Error"
          });
        }
      } catch(err) {
        console.log('Error reaching the server: ' + err);
      }
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
          <View style={{ flex: 1, backgroundColor: 'black', color: 'white', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: 'white', fontSize: 30}}>Resistor Sorter</Text>
          </View>
          <View style={{flex: 5}}>
            <Camera 
              style={{ width: width, height: height, }}
              zoom={1}
              focusDepth={1}
              ref={ref => { this.camera = ref; }}
              onCameraReady={this.getRatio.bind(this)}
              ratio={ratio}
            >
              <View style={{
                flex: 1,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
                { image ? <View style={{position: 'absolute', top: 0, right: 0}}>
                    <Image style={{width: 100, height: 100}} source={{uri: image}}/>
                    <Text style={{backgroundColor: 'white', fontSize: 20}}>
                      {this.state.value}
                    </Text>
                  </View> : null }
              </View>
          
              <View style={[
                styles.aimLine, 
                {
                  width: 100,
                  marginLeft: width / 2 - 100 / 2
                }
              ]}></View>

              
            </Camera>
          </View>
          <View style={{flex: 2, backgroundColor: 'black', alignItems: "center", justifyContent: "center"}}>
            <TouchableHighlight 
              onPress={this.getResistorValue.bind(this)} 
              underlayColor="white" 
              style={styles.button}
            >
              <View style={{backgroundColor: 'red', width: 50, height: 50, borderRadius: 25, marginTop: 25,}}></View>
            </TouchableHighlight>
          </View>
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
    height: 100,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 50
  },
  aimLine: {
    flex: 1,
    borderTopWidth: 3,
    borderTopColor: 'red',
  }
});