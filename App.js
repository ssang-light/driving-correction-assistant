import React, { Component } from "react";
import { Platform, Text, View, StyleSheet, Button } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeInterval: 10,
  distanceInterval: 20
};

let locationList = [];

export default class App extends Component {
  state = {
    subscription: null,
    currentLocation: null,
    errorMessage: null,
    isTracking: false
  };

  constructor(props) {
    super(props);
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    }
  }

  _stopTracking = async () => {
    this.state.subscription.remove();
    this.setState({
      currentLocation: null,
      subscription: null,
      isTracking: false
    });
    console.log(locationList);
  };

  _watchLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }
    this.setState({
      isTracking: true
    });
    let subscription = await Location.watchPositionAsync(
      GEOLOCATION_OPTIONS,
      location => {
        this.setState({
          currentLocation: location
        });
        locationList.push(location);
      }
    );
    this.setState({ subscription });
  };

  render() {
    let text = "Waiting..";
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.currentLocation) {
      text = JSON.stringify(this.state.currentLocation);
    }

    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
        <Button
          style={styles.button}
          title={this.state.isTracking ? "Stop tracking" : "Start tracking"}
          onPress={
            this.state.isTracking
              ? () => this._stopTracking()
              : () => this._watchLocationAsync()
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center"
  },
  button: {
    backgroundColor: "blue"
  }
});
