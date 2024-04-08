import { useCallback, useEffect } from "react";
import { StoreApi, UseBoundStore, create } from "zustand";

interface SyncTabs {
  tabs: string[] | [];
  activeTab: string | undefined;
  setTabs: (tabs: string[]) => void;
  setActiveTab: (tab: string | undefined) => void;
}

const map = new Map<string, UseBoundStore<StoreApi<SyncTabs>>>();

export function createSyncTabsStore(key: string) {
  if (map.has(key)) {
    return;
  }
  const store = create<SyncTabs>((set) => ({
    tabs: [],
    activeTab: undefined,
    setTabs: (tabs) => set({ tabs }),
    setActiveTab: (tab) => set({ activeTab: tab }),
  }));
  map.set(key, store);
  return store;
}

export function removeTabStore(tabStoreKey: string) {
  map.delete(tabStoreKey);
}

export function useSyncedTabs(tabList: string[], tabStoreKey: string) {
  const useStore = map.get(tabStoreKey) || createSyncTabsStore(tabStoreKey)!;
  const { setActiveTab, setTabs } = useStore();
  const activeTab = useStore((state) => state.activeTab);
  const tabs = useStore((state) => state.tabs);
  const onChangeTab = useCallback(
    (tab: string) => setActiveTab(tab),
    [setActiveTab],
  );

  useEffect(() => {
    if ((tabs || []).length < tabList.length) {
      // find the missing tab
      const missingTabs = tabList.filter(
        // @ts-ignore
        (tab) => !tabs.includes(tab),
      );
      setActiveTab(missingTabs[0]);
    }
    setTabs(tabList);
  }, [tabs, setTabs, tabList, activeTab]);

  useEffect(() => {
    //@ts-ignore
    if (!tabs.includes(activeTab || "")) {
      setActiveTab(tabs[0]);
    }
  }, [activeTab, tabs]);

  return {
    tabs,
    activeTab,
    onChangeTab,
  };
}
