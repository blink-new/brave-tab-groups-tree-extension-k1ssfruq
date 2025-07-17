// Background script for Tab Groups Tree View extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Groups Tree View extension installed');
});

// Listen for tab group changes
chrome.tabGroups.onCreated.addListener((group) => {
  console.log('Tab group created:', group);
});

chrome.tabGroups.onUpdated.addListener((group) => {
  console.log('Tab group updated:', group);
});

chrome.tabGroups.onRemoved.addListener((group) => {
  console.log('Tab group removed:', group);
});

// Listen for tab changes
chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab created:', tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.groupId !== undefined) {
    console.log('Tab group changed:', tab);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('Tab removed:', tabId);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabGroups') {
    getTabGroupsData().then(sendResponse);
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'switchToTab') {
    chrome.tabs.update(request.tabId, { active: true });
    chrome.windows.update(request.windowId, { focused: true });
    sendResponse({ success: true });
  }
  
  if (request.action === 'createTabGroup') {
    chrome.tabs.group({
      tabIds: request.tabIds,
      groupId: request.groupId
    }).then((groupId) => {
      if (request.groupName) {
        chrome.tabGroups.update(groupId, {
          title: request.groupName,
          color: request.color || 'blue'
        });
      }
      sendResponse({ success: true, groupId });
    });
    return true;
  }
});

// Helper function to get all tab groups and their tabs
async function getTabGroupsData() {
  try {
    const tabs = await chrome.tabs.query({});
    const groups = await chrome.tabGroups.query({});
    
    const groupsWithTabs = groups.map(group => {
      const groupTabs = tabs.filter(tab => tab.groupId === group.id);
      return {
        id: group.id,
        name: group.title || 'Unnamed Group',
        color: getGroupColor(group.color),
        collapsed: group.collapsed,
        tabs: groupTabs.map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active,
          windowId: tab.windowId
        }))
      };
    });
    
    // Also get ungrouped tabs
    const ungroupedTabs = tabs.filter(tab => tab.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE);
    
    return {
      groups: groupsWithTabs,
      ungroupedTabs: ungroupedTabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        active: tab.active,
        windowId: tab.windowId
      }))
    };
  } catch (error) {
    console.error('Error getting tab groups data:', error);
    return { groups: [], ungroupedTabs: [] };
  }
}

// Convert Chrome's color enum to hex colors
function getGroupColor(chromeColor) {
  const colorMap = {
    'grey': '#9CA3AF',
    'blue': '#3B82F6',
    'red': '#EF4444',
    'yellow': '#F59E0B',
    'green': '#10B981',
    'pink': '#EC4899',
    'purple': '#8B5CF6',
    'cyan': '#06B6D4',
    'orange': '#FB542B'
  };
  
  return colorMap[chromeColor] || '#FB542B';
}