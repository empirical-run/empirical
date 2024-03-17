import { useCallback, useEffect } from "react";
import { create } from "zustand";

interface SyncTabs {
  tabs: string[] | [];
  activeTab: string | undefined;
  setTabs: (tabs: string[]) => void;
  setActiveTab: (tab: string | undefined) => void;
}

const useTabsStore = create<SyncTabs>((set) => ({
  tabs: [],
  activeTab: undefined,
  setTabs: (tabs) => set({ tabs }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export function useSyncedTabs(tabList: string[]) {
  const { setActiveTab, setTabs } = useTabsStore();
  const activeTab = useTabsStore((state) => state.activeTab);
  const tabs = useTabsStore((state) => state.tabs);
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
  }, [tabs, setActiveTab, setTabs, tabList, activeTab]);

  useEffect(() => {
    //@ts-ignore
    if (!tabs.includes(activeTab || "")) {
      setActiveTab(tabs[0]);
    }
  }, [activeTab, tabs, setActiveTab]);

  return {
    tabs,
    activeTab,
    onChangeTab,
  };
}
