# Cell Tower Location Tracker

An Android-only React Native app that tracks user location using cell tower information without GPS or internet connectivity.

## Features

- Offline location tracking using cell tower information
- No GPS or internet required
- Pre-loaded cell tower database
- Privacy-focused approach
- Modern, clean UI with map display

## Requirements

- Android 10 or higher
- React Native development environment
- Android Studio

## Setup

1. Install dependencies:
```bash
npm install
```

2. Download the cell tower database:
   - Download OpenCellID database from https://opencellid.org/
   - Convert it to SQLite format
   - Place the database file at `android/app/src/main/assets/celltowers.db`

3. Configure Android build:
```bash
cd android
./gradlew clean
```

## Running the App

1. Start Metro:
```bash
npx react-native start
```

2. Build and run on Android:
```bash
npx react-native run-android
```

## Permissions

The app requires the following permissions:
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `READ_PHONE_STATE`

These permissions are requested at runtime and are necessary for accessing cell tower information.

## How it Works

1. The app requests necessary permissions from the user
2. Native Android code fetches current cell tower information
3. The app looks up the cell tower location in the offline database
4. Location is displayed on the map with accuracy radius

## Technical Details

- Uses React Native's Native Modules for accessing Android telephony APIs
- SQLite database for offline cell tower lookup
- React Native Maps for visualization
- TypeScript for type safety
- Modern React hooks and functional components

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT License 