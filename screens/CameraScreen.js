import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Alert, Image } from 'react-native';
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
      this.setState({
        image: photo.uri
      });
    }
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} zoom={1} focusDepth={1} ref={ref => { this.camera = ref; }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
              { this.state.image ? <Image style={{width: 193, height: 110}} source={{uri: this.state.image}}/> : null }
              <TouchableHighlight 
                onPress={this.getResistorValue.bind(this)} 
                underlayColor="white" 
                style={styles.button}
              >
                <View>
                  <Text style={styles.buttonText}>Capture</Text>
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
  }
});