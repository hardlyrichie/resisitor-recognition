import React from 'react';
import { View, Button, Text } from 'react-native';

export default class HelpScreen extends React.Component {
    render() {
  
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Help Screen</Text>
          <Button
            title="Go back"
            onPress={() => this.props.navigation.goBack()}
          />
        </View>
      );
    }
  }