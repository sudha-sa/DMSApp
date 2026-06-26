# Document Management System (DMSApp)

DMSApp is a React Native mobile application for managing documents with authentication, upload, search, and navigation features. It is intended to be easy to run on another machine, emulator, or device by following the steps below.

## Overview

This app includes:
- OTP-based login flow
- Document upload with metadata, tags, and file attachment
- Document search by category, subcategory, date, and tag
- Redux-based authentication state
- Bottom tab navigation for the main screens

## Tech Stack

- React Native 0.86
- Redux Toolkit
- React Navigation
- Axios
- react-native-element-dropdown
- @react-native-community/datetimepicker
- @react-native-documents/picker

## Prerequisites

Before running the project, make sure the following are installed:
- Node.js and npm
- Android Studio with an emulator, or a physical Android device
- Xcode (for iOS, if needed)
- React Native development prerequisites for your OS

## Installation

1. Clone or download the repository.
2. Open the project folder in a terminal.
3. Install dependencies:

```bash
npm install
```

## Running the App

### Android

Start the Metro bundler:

```bash
npx react-native start
```

In a second terminal, run:

```bash
npx react-native run-android
```

### iOS

```bash
npx react-native run-ios
```

## Project Structure

- src/screens - Login, Upload, and Search screens
- src/services - API service layer
- src/store - Redux store and auth slice
- src/navigation - Navigation setup
- android/ and ios/ - Native project files

## Notes for Team Members or Other Devices

- The app currently uses mock API responses in [src/services/api.js](src/services/api.js) for local testing.
- If you want to connect to the real backend, update the mock toggle in [src/services/api.js](src/services/api.js).
- If you are running on another machine, ensure the required Android/iOS environment is set up before launching the app.

