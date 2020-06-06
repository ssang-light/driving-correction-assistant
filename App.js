import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeInterval: 10,
  distanceInterval: 20,
};

let locationList = [];

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(
    null,
  );
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [recording, setRecording] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    })();
  }, []);

  _stopTracking = async () => {
    setSubscription(null);
    setCurrentLocation(null);
    setSubscription(null);
    setIsTracking(false);
    console.log(locationList);
  };

  _watchLocationAsync = async () => {
    setIsTracking(true);

    let subscription = await Location.watchPositionAsync(
      GEOLOCATION_OPTIONS,
      (location) => {
        setCurrentLocation(location);
        locationList.push(location);
      },
    );
    setSubscription(subscription);
  };

  if (hasCameraPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (hasMediaLibraryPermission === null) {
    return <View />;
  }

  if (hasMediaLibraryPermission === false) {
    return <Text>No access to MediaLibrary</Text>;
  }

  if (hasLocationPermission === null) {
    return <View />;
  }

  if (hasLocationPermission === false) {
    return <Text>No access to Location</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={type}
        ref={(ref) => {
          setCameraRef(ref);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: 'flex-end',
              }}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back,
                );
              }}
            >
              <Ionicons
                name={
                  Platform.OS === 'ios'
                    ? 'ios-reverse-camera'
                    : 'md-reverse-camera'
                }
                size={40}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignSelf: 'center' }}
              onPress={async () => {
                if (cameraRef) {
                  let photo = await cameraRef.takePictureAsync();
                  console.log('photo', photo);
                  let asset = await MediaLibrary.createAssetAsync(photo.uri);
                }
              }}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: '50%',
                  borderColor: 'white',
                  height: 50,
                  width: 50,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: '50%',
                    borderColor: 'white',
                    height: 40,
                    width: 40,
                    backgroundColor: 'white',
                  }}
                ></View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignSelf: 'center' }}
              onPress={async () => {
                if (!recording) {
                  setRecording(true);
                  let video = await cameraRef.recordAsync();
                  console.log('video', video);
                  this._watchLocationAsync();
                  let asset = await MediaLibrary.createAssetAsync(video.uri);
                } else {
                  setRecording(false);
                  cameraRef.stopRecording();
                  this._stopTracking();
                }
              }}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: '50%',
                  borderColor: 'red',
                  height: 50,
                  width: 50,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: '50%',
                    borderColor: recording ? 'blue' : 'red',
                    height: 40,
                    width: 40,
                    backgroundColor: recording ? 'blue' : 'red',
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}
