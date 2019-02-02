import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Alert } from 'react-native';
import { Camera, Permissions } from 'expo';

export default class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
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
          <Camera style={{ flex: 1 }} zoom={1} focusDepth={1}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableHighlight onPress={() => Alert.alert('Pressed')} underlayColor="white" style={styles.button}>
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
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'blue',
    transform: [{ rotate: '90deg'}]
  }
});