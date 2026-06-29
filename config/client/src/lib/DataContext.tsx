import { createContext, useContext, useEffect, useState } from "react";
import { type SiteData, loadData } from "./data";

interface DataContextType {
  data: SiteData | null;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({ data: null, loading: true });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <DataContext.Provider value={{ data, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
