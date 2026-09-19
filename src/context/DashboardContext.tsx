import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardPage, Language, DataQualityReport, CalculationWeightMode } from '../types/dashboard';
import { AllDatasets, loadAllDatasets } from '../data/dataLoader';
import { validateAllDatasets } from '../data/dataValidator';

interface DashboardContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  weightMode: CalculationWeightMode;
  setWeightMode: (mode: CalculationWeightMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activePage: DashboardPage;
  setActivePage: (page: DashboardPage) => void;
  datasets: AllDatasets | null;
  loading: boolean;
  error: string | null;
  qualityReports: DataQualityReport[];
  showMethodology: boolean;
  setShowMethodology: (show: boolean) => void;
  showQualityModal: boolean;
  setShowQualityModal: (show: boolean) => void;
  resetFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [weightMode, setWeightMode] = useState<CalculationWeightMode>('unweighted');
  const [language, setLanguage] = useState<Language>('th');
  const [activePage, setActivePage] = useState<DashboardPage>(1);

  const [datasets, setDatasets] = useState<AllDatasets | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [qualityReports, setQualityReports] = useState<DataQualityReport[]>([]);

  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadAllDatasets();
        if (isMounted) {
          setDatasets(data);
          const reports = validateAllDatasets(data);
          setQualityReports(reports);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load datasets');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const resetFilters = () => {
    setSelectedYear('all');
    setSelectedCountry('all');
    setWeightMode('unweighted');
  };

  return (
    <DashboardContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        selectedCountry,
        setSelectedCountry,
        weightMode,
        setWeightMode,
        language,
        setLanguage,
        activePage,
        setActivePage,
        datasets,
        loading,
        error,
        qualityReports,
        showMethodology,
        setShowMethodology,
        showQualityModal,
        setShowQualityModal,
        resetFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
