# Web Security Guardian Browser Extension

A browser extension that detects and blocks malicious websites with user-controlled warning popups.

## Features

- **Real-time Website Checking**: Scans websites for malicious patterns and known phishing domains
- **User Control**: Choose to proceed or cancel when a suspicious site is detected
- **Trusted Sites Management**: Easily add or remove sites from your trusted list
- **Customizable Protection**: Enable or disable protection as needed
- **Remember User Choices**: Option to remember your decisions for specific websites

## Components

### Popup Interface

The extension popup allows users to:
- Toggle protection on/off
- Toggle the "remember choices" setting
- View and manage trusted sites
- Clear all trusted sites

### Background Processing

The extension runs in the background to:
- Monitor web navigation
- Check URLs against malicious patterns
- Store user preferences
- Handle communication between popup and content scripts

### Content Script

The content script injects a warning modal into potentially malicious websites, allowing users to:
- Go back to safety
- Proceed to the site anyway (with risk acknowledgment)

### Blocked Page

A dedicated page shown when a malicious site is blocked, with options to:
- Return to the previous page
- Access extension settings
- Proceed anyway (with risk acknowledgment)

## Installation

1. Download the extension files
2. In Chrome/Edge, navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension is now installed and active

## Usage

1. Click the extension icon in your browser toolbar to access settings
2. When visiting a suspicious site, a warning popup will appear
3. Choose to proceed or go back to safety
4. Manage your trusted sites through the extension popup

## Future Improvements

- Integration with real-time phishing detection APIs
- Enhanced machine learning detection
- User notifications for emerging threats
- Site categorization with specific warnings by threat type
- Performance optimizations for faster checks

## Technologies Used

- JavaScript
- HTML/CSS
- Chrome Extension Manifest V3
- Local Storage API

## License

MIT License - See LICENSE file for details
