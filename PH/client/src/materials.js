import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MATERIALS as DEFAULT_NAMES, DEFAULT_COMMISSION, DEFAULT_LABOUR } from './utils';

// Configurable material list (Settings → Materials), shared by every material picklist.
// Each material carries the seller commission (%) and labour charge (₹/bag) applied at registration.
const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const DEFAULT_CONFIG = DEFAULT_NAMES.map(name => ({ name, commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR }));

// Accepts plain names too (lists saved before rates existed)
const normalize = (list) => list.map(m => (typeof m === 'string'
  ? { name: m, commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR }
  : { name: m.name, commission: Number(m.commission ?? DEFAULT_COMMISSION), labour: Number(m.labour ?? DEFAULT_LABOUR) }));

const MaterialsContext = createContext({
  materials: DEFAULT_NAMES,
  materialConfig: DEFAULT_CONFIG,
  getMaterialRates: () => ({ commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR }),
  saveMaterials: async () => DEFAULT_CONFIG,
  reloadMaterials: async () => {},
});

export function MaterialsProvider({ children }) {
  const [materialConfig, setMaterialConfig] = useState(DEFAULT_CONFIG);

  const reloadMaterials = useCallback(async () => {
    try {
      const res = await API.get('/api/settings/materials');
      if (Array.isArray(res.data.data) && res.data.data.length) setMaterialConfig(normalize(res.data.data));
    } catch {
      // Server unreachable — keep the current (default) list so forms still work
    }
  }, []);

  const saveMaterials = useCallback(async (list) => {
    const res = await API.put('/api/settings/materials', { materials: list });
    const saved = normalize(res.data.data);
    setMaterialConfig(saved);
    return saved;
  }, []);

  useEffect(() => { reloadMaterials(); }, [reloadMaterials]);

  const value = useMemo(() => ({
    materials: materialConfig.map(m => m.name),
    materialConfig,
    getMaterialRates: (name) => {
      const m = materialConfig.find(c => c.name === name);
      return m ? { commission: m.commission, labour: m.labour } : { commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR };
    },
    saveMaterials,
    reloadMaterials,
  }), [materialConfig, saveMaterials, reloadMaterials]);

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>;
}

export const useMaterials = () => useContext(MaterialsContext);

// Picklist options: the configured list, plus the record's current value if it was since removed
export const withCurrent = (materials, current) =>
  current && !materials.includes(current) ? [...materials, current] : materials;
