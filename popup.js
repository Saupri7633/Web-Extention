// Storage keys
const STORAGE_KEY = 'webSecurityGuardianSettings';

// Default settings
const defaultSettings = {
  isProtectionEnabled: true,
  rememberChoices: true,
  trustedSites: []
};

// DOM elements
const protectionToggle = document.getElementById('protection-toggle');
const rememberToggle = document.getElementById('remember-toggle');
const protectionStatus = document.getElementById('protection-status');
const trustedSitesBtn = document.getElementById('trusted-sites-btn');
const trustedSitesPanel = document.getElementById('trusted-sites-panel');
const trustedSitesList = document.getElementById('trusted-sites-list');
const clearSitesBtn = document.getElementById('clear-sites-btn');

// Current settings
let currentSettings = { ...defaultSettings };

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    if (result[STORAGE_KEY]) {
      currentSettings = result[STORAGE_KEY];
      
      // Update UI to reflect settings
      protectionToggle.checked = currentSettings.isProtectionEnabled;
      rememberToggle.checked = currentSettings.rememberChoices;
      updateProtectionStatus();
      updateTrustedSitesList();
    } else {
      // If no settings are found, save default settings
      saveSettings();
    }
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.local.set({ [STORAGE_KEY]: currentSettings }, () => {
    // Notify the background script about the settings change
    chrome.runtime.sendMessage({ action: 'settingsUpdated', settings: currentSettings });
    
    // Update UI
    updateProtectionStatus();
    updateTrustedSitesList();
  });
}

// Update protection status text
function updateProtectionStatus() {
  protectionStatus.textContent = currentSettings.isProtectionEnabled 
    ? 'Protection is active' 
    : 'Protection is disabled';
  
  // Change header color based on protection status
  const iconContainer = document.querySelector('.icon-container');
  const icon = iconContainer.querySelector('.material-icons');
  
  if (currentSettings.isProtectionEnabled) {
    iconContainer.style.backgroundColor = '#e6f4ea';
    icon.className = 'material-icons text-safe';
    icon.textContent = 'security';
  } else {
    iconContainer.style.backgroundColor = '#fce8e6';
    icon.className = 'material-icons text-destructive';
    icon.textContent = 'security';
  }
}

// Update trusted sites list
function updateTrustedSitesList() {
  // Clear the list
  trustedSitesList.innerHTML = '';
  
  if (currentSettings.trustedSites.length > 0) {
    // Show clear button
    clearSitesBtn.classList.remove('hidden');
    
    // Create list items for each trusted site
    currentSettings.trustedSites.forEach(site => {
      const item = document.createElement('div');
      item.className = 'trusted-site-item';
      
      const siteInfo = document.createElement('div');
      siteInfo.className = 'site-info';
      
      const icon = document.createElement('span');
      icon.className = 'material-icons';
      icon.textContent = 'check_circle';
      
      const siteText = document.createElement('span');
      siteText.textContent = site;
      
      siteInfo.appendChild(icon);
      siteInfo.appendChild(siteText);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-site';
      removeBtn.innerHTML = '<span class="material-icons">close</span>';
      removeBtn.addEventListener('click', () => removeTrustedSite(site));
      
      item.appendChild(siteInfo);
      item.appendChild(removeBtn);
      
      trustedSitesList.appendChild(item);
    });
  } else {
    // Hide clear button
    clearSitesBtn.classList.add('hidden');
    
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const emptyText = document.createElement('p');
    emptyText.textContent = 'No trusted sites yet';
    
    const emptyDesc = document.createElement('p');
    emptyDesc.className = 'setting-description';
    emptyDesc.textContent = 'Sites you choose to proceed to will appear here';
    
    emptyState.appendChild(emptyText);
    emptyState.appendChild(emptyDesc);
    
    trustedSitesList.appendChild(emptyState);
  }
}

// Remove a trusted site
function removeTrustedSite(site) {
  currentSettings.trustedSites = currentSettings.trustedSites.filter(s => s !== site);
  saveSettings();
}

// Clear all trusted sites
function clearAllTrustedSites() {
  currentSettings.trustedSites = [];
  saveSettings();
}

// Event listeners
protectionToggle.addEventListener('change', function() {
  currentSettings.isProtectionEnabled = this.checked;
  saveSettings();
});

rememberToggle.addEventListener('change', function() {
  currentSettings.rememberChoices = this.checked;
  saveSettings();
});

trustedSitesBtn.addEventListener('click', function() {
  trustedSitesPanel.classList.toggle('hidden');
  this.textContent = trustedSitesPanel.classList.contains('hidden') 
    ? 'Manage Trusted Sites' 
    : 'Hide Trusted Sites';
});

clearSitesBtn.addEventListener('click', clearAllTrustedSites);

// Initialize the popup
document.addEventListener('DOMContentLoaded', loadSettings);