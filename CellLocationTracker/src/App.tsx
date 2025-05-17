import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  NativeModules,
  Platform,
  Alert,
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MapView, { Marker } from 'react-native-maps';
import { CellTowerInfo } from './types/CellInfo';
import DatabaseHelper, { CellTowerLocation } from './utils/DatabaseHelper';

const App = () => {
  const [location, setLocation] = useState<CellTowerLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    try {
      const permissions = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.READ_PHONE_STATE,
      ];

      const results = await Promise.all(
        permissions.map(permission => request(permission))
      );

      const allGranted = results.every(result => result === RESULTS.GRANTED);
      if (!allGranted) {
        setError('Required permissions not granted');
        return false;
      }
      return true;
    } catch (err) {
      setError('Error requesting permissions');
      return false;
    }
  };

  const initializeDatabase = async () => {
    try {
      await DatabaseHelper.init();
    } catch (err) {
      setError('Failed to initialize database');
    }
  };

  const updateLocation = async () => {
    try {
      NativeModules.CellInfoModule.getCellTowerInfo(
        (error: string) => {
          setError(error);
        },
        async (cellInfo: CellTowerInfo) => {
          try {
            const location = await DatabaseHelper.findLocation(cellInfo);
            if (location) {
              setLocation(location);
              setError(null);
            } else {
              setError('Location not found in database');
            }
          } catch (err) {
            setError('Error looking up location');
          }
        }
      );
    } catch (err) {
      setError('Error getting cell tower info');
    }
  };

  useEffect(() => {
    const setup = async () => {
      const permissionsGranted = await requestPermissions();
      if (permissionsGranted) {
        await initializeDatabase();
        await updateLocation();
      }
    };

    setup();

    return () => {
      DatabaseHelper.close();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cell Tower Location Tracker</Text>
        <Text style={styles.subtitle}>No GPS or Internet Required</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : location ? (
        <View style={styles.content}>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinates}>
              Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinates}>
              Longitude: {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracy}>
              Accuracy: ±{location.accuracy} meters
            </Text>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            zoomEnabled={true}
            rotateEnabled={false}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
            />
          </MapView>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Finding your location...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  coordinatesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  coordinates: {
    fontSize: 16,
    marginBottom: 8,
  },
  accuracy: {
    fontSize: 14,
    color: '#666666',
  },
  map: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App; 