'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface SidebarState {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  expandedSections: Set<string>;
}

interface SidebarContextType {
  state: SidebarState;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
  collapse: () => void;
  expand: () => void;
  toggleCollapsed: () => void;
  expandSection: (id: string) => void;
  collapseSection: (id: string) => void;
  toggleSection: (id: string) => void;
  isSectionExpanded: (id: string) => boolean;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SidebarState>({
    isMobileOpen: false,
    isCollapsed: false,
    expandedSections: new Set(['procurement', 'orders'])
  });

  const openMobile = useCallback(() => {
    setState(prev => ({ ...prev, isMobileOpen: true }));
  }, []);

  const closeMobile = useCallback(() => {
    setState(prev => ({ ...prev, isMobileOpen: false }));
  }, []);

  const toggleMobile = useCallback(() => {
    setState(prev => ({ ...prev, isMobileOpen: !prev.isMobileOpen }));
  }, []);

  const collapse = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: true }));
  }, []);

  const expand = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: false }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const expandSection = useCallback((id: string) => {
    setState(prev => {
      const newSections = new Set(prev.expandedSections);
      newSections.add(id);
      return { ...prev, expandedSections: newSections };
    });
  }, []);

  const collapseSection = useCallback((id: string) => {
    setState(prev => {
      const newSections = new Set(prev.expandedSections);
      newSections.delete(id);
      return { ...prev, expandedSections: newSections };
    });
  }, []);

  const toggleSection = useCallback((id: string) => {
    setState(prev => {
      const newSections = new Set(prev.expandedSections);
      if (newSections.has(id)) {
        newSections.delete(id);
      } else {
        newSections.add(id);
      }
      return { ...prev, expandedSections: newSections };
    });
  }, []);

  const isSectionExpanded = useCallback((id: string) => {
    return state.expandedSections.has(id);
  }, [state.expandedSections]);

  return (
    <SidebarContext.Provider value={{
      state,
      openMobile,
      closeMobile,
      toggleMobile,
      collapse,
      expand,
      toggleCollapsed,
      expandSection,
      collapseSection,
      toggleSection,
      isSectionExpanded
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarState must be used within a SidebarProvider');
  }
  return context;
}
