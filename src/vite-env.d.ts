/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>
  export default component
}

// Chrome extension types
declare global {
  namespace chrome {
    namespace tabs {
      interface Tab {
        id?: number
        title?: string
        url?: string
        favIconUrl?: string
        active?: boolean
        groupId?: number
      }
      
      function query(queryInfo: any): Promise<Tab[]>
      function update(tabId: number, updateProperties: any): Promise<Tab>
    }
    
    namespace tabGroups {
      interface TabGroup {
        id: number
        title?: string
        color: string
        collapsed: boolean
      }
      
      function query(queryInfo: any): Promise<TabGroup[]>
    }
    
    namespace windows {
      const WINDOW_ID_CURRENT: number
    }
    
    namespace runtime {
      interface Message {
        type: string
        [key: string]: any
      }
      
      function onMessage(callback: (message: Message) => void): void
    }
  }
}

export {}