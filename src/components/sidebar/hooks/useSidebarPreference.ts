'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tradewave-sidebar-preferences';

interface SidebarPreferences {
  isCollapsed: boolean;
  expandedSections: Record<string, boolean>;
}

const defaultPreferences: SidebarPreferences = {
  isCollapsed: false,
  expandedSections: {}
};

export function useSidebarPreference() {
  const [preferences, setPreferences] = useState<SidebarPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load sidebar preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save sidebar preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setPreferences(prev => ({ ...prev, isCollapsed: collapsed }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setPreferences(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const setSectionExpanded = useCallback((sectionId: string, expanded: boolean) => {
    setPreferences(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [sectionId]: expanded
      }
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [sectionId]: !prev.expandedSections[sectionId]
      }
    }));
  }, []);

  const isSectionExpanded = useCallback((sectionId: string, defaultExpanded = true) => {
    if (sectionId in preferences.expandedSections) {
      return preferences.expandedSections[sectionId];
    }
    return defaultExpanded;
  }, [preferences.expandedSections]);

  return {
    isCollapsed: preferences.isCollapsed,
    setIsCollapsed,
    toggleCollapsed,
    setSectionExpanded,
    toggleSection,
    isSectionExpanded,
    isLoaded
  };
}
