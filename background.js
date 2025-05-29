// Storage keys
const STORAGE_KEY = 'webSecurityGuardianSettings';

// Default settings
const defaultSettings = {
  isProtectionEnabled: true,
  rememberChoices: true,
  trustedSites: []
};

// Current settings
let settings = { ...defaultSettings };

// Google Safe Browsing API configuration
const SAFE_BROWSING_API_KEY = 'AIzaSyBWy0m7We3MN7h_JVim6YE9G8Y0xfEiNkU';
const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    if (result[STORAGE_KEY]) {
      settings = result[STORAGE_KEY];
    } else {
      // If no settings found, save default settings
      saveSettings();
    }
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
    return url;
  }
}

// Check if a site is trusted
function isTrustedSite(url) {
  const domain = extractDomain(url);
  return settings.trustedSites.includes(domain);
}

// Check if a URL is potentially malicious
async function checkUrl(url) {
  try {
    const response = await fetch(SAFE_BROWSING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: {
          clientId: 'malware-sentry-extension',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: url }]
        }
      })
    });

    const data = await response.json();
    return {
      isMalicious: data.matches && data.matches.length > 0,
      threats: data.matches || []
    };
  } catch (error) {
    console.error('Error checking URL:', error);
    return { isMalicious: false, threats: [] };
  }
}

// Handle web navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only check main frame navigations (not iframes, etc)
  if (details.frameId !== 0) return;
  
  // Skip if protection is disabled
  if (!settings.isProtectionEnabled) return;
  
  const url = details.url;
  
  // Skip checks for trusted sites
  if (settings.rememberChoices && isTrustedSite(url)) return;
  
  // Check if URL is potentially malicious
  const result = await checkUrl(url);
  
  if (result.isMalicious) {
    // Get the tab ID where navigation is happening
    const tabId = details.tabId;
    
    // Store information about this detection for the content script to use
    chrome.storage.session.set({
      [`detection_${tabId}`]: {
        url: url,
        isMalicious: true,
        timestamp: Date.now()
      }
    });
    
    // Let the content script know it should show a warning
    chrome.tabs.sendMessage(tabId, {
      action: 'showWarning',
      url: url
    }).catch(error => {
      console.error('Error sending message to tab:', error);
      // If the content script isn't ready yet, we'll handle this later
      // when it sends us a 'contentScriptReady' message
    });
  }
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle settings updates from popup
  if (message.action === 'settingsUpdated') {
    settings = message.settings;
  }
  
  // Handle content script reporting it's ready
  if (message.action === 'contentScriptReady') {
    const tabId = sender.tab.id;
    // Check if we have a pending detection for this tab
    chrome.storage.session.get(`detection_${tabId}`, (result) => {
      const detection = result[`detection_${tabId}`];
      if (detection && detection.isMalicious) {
        // Send the warning message again
        chrome.tabs.sendMessage(tabId, {
          action: 'showWarning',
          url: detection.url
        });
      }
    });
  }
  
  // Handle user decision to proceed to a site
  if (message.action === 'proceedToSite') {
    const url = message.url;
    const domain = extractDomain(url);
    
    // If user wants to remember their choice, add to trusted sites
    if (settings.rememberChoices) {
      if (!settings.trustedSites.includes(domain)) {
        settings.trustedSites.push(domain);
        saveSettings();
      }
    }
    
    // Remove the detection record
    chrome.storage.session.remove(`detection_${sender.tab.id}`);
    
    sendResponse({ success: true });
  }
  
  // Handle user decision to block a site
  if (message.action === 'blockSite') {
    // Redirect to a safe page
    chrome.tabs.update(sender.tab.id, {
      url: chrome.runtime.getURL('blocked.html') + `?url=${encodeURIComponent(message.url)}`
    });
    
    // Remove the detection record
    chrome.storage.session.remove(`detection_${sender.tab.id}`);
    
    sendResponse({ success: true });
  }
  
  // Return true to indicate we might respond asynchronously
  return true;
});

// Initialize on startup
loadSettings();