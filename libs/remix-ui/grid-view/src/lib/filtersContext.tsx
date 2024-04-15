import React, { createContext, useState, useContext } from 'react';

interface FilterContextType {
  showUntagged: boolean
  keyValueMap: Record<string, { enabled: boolean; color: string; }>;
  updateValue: (key: string, enabled: boolean, color: string) => void
  addValue: (key: string, enabled: boolean, color: string) => void
}
const FiltersContext = createContext<FilterContextType>({
  showUntagged: false,
  keyValueMap: {},
  updateValue: () => {},
  addValue: () => {},
});

export default FiltersContext
