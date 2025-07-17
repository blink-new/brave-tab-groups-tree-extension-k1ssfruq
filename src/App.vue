<template>
  <div id="app" class="extension-container">
    <header class="extension-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-sitemap text-primary"></i>
          <h1>Tab Groups</h1>
        </div>
        <div class="header-actions">
          <Button 
            icon="pi pi-refresh" 
            severity="secondary" 
            text 
            rounded 
            size="small"
            @click="refreshTabGroups"
            v-tooltip="'Refresh'"
          />
          <Button 
            icon="pi pi-cog" 
            severity="secondary" 
            text 
            rounded 
            size="small"
            v-tooltip="'Settings'"
          />
        </div>
      </div>
    </header>

    <div class="search-container">
      <div class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <InputText 
          v-model="searchQuery" 
          placeholder="Search tabs and groups..."
          class="search-input"
        />
      </div>
    </div>

    <ScrollPanel class="tree-container">
      <div class="tree-content">
        <div v-if="filteredTabGroups.length === 0" class="empty-state">
          <i class="pi pi-folder-open"></i>
          <p>No tab groups found</p>
          <small>Create tab groups in Brave to see them here</small>
        </div>

        <div v-else class="tab-groups">
          <div 
            v-for="group in filteredTabGroups" 
            :key="group.id"
            class="tab-group"
          >
            <div 
              class="group-header"
              @click="toggleGroup(group.id)"
            >
              <div class="group-info">
                <i 
                  :class="group.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                  class="expand-icon"
                ></i>
                <div 
                  class="group-color-indicator"
                  :style="{ backgroundColor: group.color }"
                ></div>
                <span class="group-name">{{ group.name }}</span>
                <Badge 
                  :value="group.tabs.length" 
                  severity="secondary"
                  class="tab-count"
                />
              </div>
            </div>

            <Transition name="expand">
              <div v-if="group.expanded" class="group-tabs">
                <div 
                  v-for="tab in group.tabs"
                  :key="tab.id"
                  class="tab-item"
                  :class="{ active: tab.active }"
                  @click="switchToTab(tab.id)"
                >
                  <img 
                    :src="tab.favIconUrl || '/favicon.svg'" 
                    :alt="tab.title"
                    class="tab-favicon"
                    @error="handleFaviconError"
                  />
                  <div class="tab-info">
                    <span class="tab-title">{{ tab.title }}</span>
                    <span class="tab-url">{{ formatUrl(tab.url) }}</span>
                  </div>
                  <i v-if="tab.active" class="pi pi-circle-fill active-indicator"></i>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </ScrollPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ScrollPanel from 'primevue/scrollpanel'
import Badge from 'primevue/badge'

interface Tab {
  id: number
  title: string
  url: string
  favIconUrl?: string
  active: boolean
}

interface TabGroup {
  id: number
  name: string
  color: string
  tabs: Tab[]
  expanded: boolean
}

const searchQuery = ref('')
const tabGroups = ref<TabGroup[]>([])

// Mock data for development
const mockTabGroups: TabGroup[] = [
  {
    id: 1,
    name: 'Work',
    color: '#FB542B',
    expanded: true,
    tabs: [
      {
        id: 1,
        title: 'Gmail - Inbox',
        url: 'https://mail.google.com',
        favIconUrl: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
        active: true
      },
      {
        id: 2,
        title: 'Slack - Team Chat',
        url: 'https://app.slack.com',
        favIconUrl: 'https://a.slack-edge.com/80588/img/icons/app-256.png',
        active: false
      },
      {
        id: 3,
        title: 'GitHub - Dashboard',
        url: 'https://github.com',
        favIconUrl: 'https://github.com/favicon.ico',
        active: false
      }
    ]
  },
  {
    id: 2,
    name: 'Research',
    color: '#4F46E5',
    expanded: false,
    tabs: [
      {
        id: 4,
        title: 'Vue.js Documentation',
        url: 'https://vuejs.org',
        favIconUrl: 'https://vuejs.org/logo.svg',
        active: false
      },
      {
        id: 5,
        title: 'PrimeVue Components',
        url: 'https://primevue.org',
        favIconUrl: 'https://primevue.org/favicon.ico',
        active: false
      }
    ]
  },
  {
    id: 3,
    name: 'Entertainment',
    color: '#10B981',
    expanded: false,
    tabs: [
      {
        id: 6,
        title: 'YouTube',
        url: 'https://youtube.com',
        favIconUrl: 'https://www.youtube.com/favicon.ico',
        active: false
      },
      {
        id: 7,
        title: 'Netflix',
        url: 'https://netflix.com',
        favIconUrl: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
        active: false
      }
    ]
  }
]

const filteredTabGroups = computed(() => {
  if (!searchQuery.value) return tabGroups.value
  
  return tabGroups.value.filter(group => {
    const groupMatch = group.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const tabMatch = group.tabs.some(tab => 
      tab.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tab.url.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    return groupMatch || tabMatch
  })
})

const toggleGroup = (groupId: number) => {
  const group = tabGroups.value.find(g => g.id === groupId)
  if (group) {
    group.expanded = !group.expanded
  }
}

const switchToTab = async (tabId: number) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Real extension environment
      const tab = findTabById(tabId)
      if (tab) {
        await chrome.runtime.sendMessage({ 
          action: 'switchToTab', 
          tabId: tabId,
          windowId: (tab as any).windowId 
        })
        // Close the popup after switching
        window.close()
      }
    } else {
      // Development environment - just update active state
      console.log('Development mode: switching to tab', tabId)
      tabGroups.value.forEach(group => {
        group.tabs.forEach(tab => {
          tab.active = tab.id === tabId
        })
      })
    }
  } catch (error) {
    console.error('Error switching to tab:', error)
  }
}

const findTabById = (tabId: number) => {
  for (const group of tabGroups.value) {
    const tab = group.tabs.find(t => t.id === tabId)
    if (tab) return tab
  }
  return null
}

const refreshTabGroups = async () => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Real extension environment
      const response = await chrome.runtime.sendMessage({ action: 'getTabGroups' })
      if (response && response.groups) {
        tabGroups.value = response.groups.map((group: any) => ({
          ...group,
          expanded: !group.collapsed
        }))
      }
    } else {
      // Development environment - use mock data
      console.log('Development mode: using mock data')
      tabGroups.value = [...mockTabGroups]
    }
  } catch (error) {
    console.error('Error refreshing tab groups:', error)
    // Fallback to mock data
    tabGroups.value = [...mockTabGroups]
  }
}

const handleFaviconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/favicon.svg'
}

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

onMounted(() => {
  refreshTabGroups()
})
</script>

<style scoped>
.extension-container {
  width: 380px;
  height: 600px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.extension-header {
  background: linear-gradient(135deg, #FB542B 0%, #ff6b47 100%);
  color: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(251, 84, 43, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title i {
  font-size: 20px;
}

.header-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.search-input {
  width: 100%;
}

.tree-container {
  height: calc(600px - 140px);
}

.tree-content {
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-state small {
  opacity: 0.7;
}

.tab-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-group {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.group-header {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f9fafb;
}

.group-header:hover {
  background: #f9fafb;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 12px;
  color: #6b7280;
  transition: transform 0.2s;
}

.group-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.group-name {
  font-weight: 500;
  color: #111827;
  flex: 1;
}

.tab-count {
  font-size: 11px;
}

.group-tabs {
  background: #fafafa;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.tab-item:last-child {
  border-bottom: none;
}

.tab-item:hover {
  background: #f3f4f6;
}

.tab-item.active {
  background: #fef3f2;
  border-left: 3px solid #FB542B;
}

.tab-favicon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 2px;
}

.tab-info {
  flex: 1;
  min-width: 0;
}

.tab-title {
  display: block;
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-url {
  display: block;
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-indicator {
  color: #FB542B;
  font-size: 8px;
  flex-shrink: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

.text-primary {
  color: #FB542B;
}
</style>