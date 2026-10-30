import { useState } from 'react';

export function useAppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return {
    isSidebarCollapsed,
    toggleSidebar,
  };
}

