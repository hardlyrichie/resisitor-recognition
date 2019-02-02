import React from 'react';
import { View, Button } from 'react-native';

export default class HomeScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
  
      return {
        headerTitle: "Resistor Sorter",
      };
    };
  
    render() {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button
            title="Go to Camera"
            onPress={() => this.props.navigation.navigate('Camera')}
          />
          <Button
            title="Help"
            onPress={() => this.props.navigation.navigate('Help')}
          />
        </View>
      );
    }
  };