// Create and show the warning modal
function showWarningModal(url) {
  // Prevent multiple warnings
  if (document.getElementById('security-warning-modal')) {
    return;
  }
  
  // Create the modal container
  const modal = document.createElement('div');
  modal.id = 'security-warning-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  `;
  
  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: white;
    border-radius: 8px;
    width: 450px;
    max-width: 90%;
    padding: 24px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  `;
  
  // Warning icon
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    background-color: #fef0f0;
    width: 64px;
    height: 64px;
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px auto;
  `;
  
  // Use an emoji as the warning icon
  const warningIcon = document.createElement('div');
  warningIcon.innerHTML = '⚠️';
  warningIcon.style.cssText = `
    font-size: 32px;
  `;
  
  iconContainer.appendChild(warningIcon);
  
  // Warning title
  const title = document.createElement('h2');
  title.textContent = 'Warning: Potentially Malicious Website';
  title.style.cssText = `
    color: #d93025;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin: 0 0 16px 0;
  `;
  
  // Warning message
  const message = document.createElement('p');
  message.innerHTML = `
    This site (<strong>${extractDomain(url)}</strong>) may be attempting to steal your personal information.
    <br><br>
    Visiting this page may harm your device or compromise your data.
  `;
  message.style.cssText = `
    color: #202124;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 24px 0;
    text-align: center;
  `;
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 16px;
  `;
  
  // Back button
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to safety';
  backButton.style.cssText = `
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  // Proceed button
  const proceedButton = document.createElement('button');
  proceedButton.textContent = 'Proceed anyway';
  proceedButton.style.cssText = `
    background-color: transparent;
    color: #5f6368;
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `;
  
  // Add event listeners to buttons
  backButton.addEventListener('click', () => {
    // Tell the background script the user wants to block this site
    chrome.runtime.sendMessage({
      action: 'blockSite',
      url: url
    });
    
    // Remove the modal
    document.body.removeChild(modal);
  });
  
  proceedButton.addEventListener('click', () => {
    // Tell the background script the user wants to proceed
    chrome.runtime.sendMessage({
      action: 'proceedToSite',
      url: url
    });
    
    // Remove the modal
    document.body.removeChild(modal);
  });
  
  // Assemble the modal
  buttonContainer.appendChild(backButton);
  buttonContainer.appendChild(proceedButton);
  
  modalContent.appendChild(iconContainer);
  modalContent.appendChild(title);
  modalContent.appendChild(message);
  modalContent.appendChild(buttonContainer);
  
  modal.appendChild(modalContent);
  
  // Add the modal to the page
  if (document.body) {
    document.body.appendChild(modal);
  } else {
    // If body isn't ready yet, wait for it
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(modal);
    });
  }
}

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
    return url;
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showWarning') {
    // Make sure the DOM is ready before showing warning
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      showWarningModal(message.url);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        showWarningModal(message.url);
      });
    }
    
    sendResponse({ success: true });
  }
  
  // Return true to indicate we might respond asynchronously
  return true;
});

// Tell the background script that the content script is ready
chrome.runtime.sendMessage({ action: 'contentScriptReady' });