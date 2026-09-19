import React from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { CharacteristicsPage } from './pages/CharacteristicsPage';
import { TravelBehaviorPage } from './pages/TravelBehaviorPage';
import { TravelObjectivesPage } from './pages/TravelObjectivesPage';
import { LengthOfStayPage } from './pages/LengthOfStayPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomeRevenuePage } from './pages/IncomeRevenuePage';

const PageRenderer: React.FC = () => {
  const { activePage } = useDashboard();

  switch (activePage) {
    case 1:
      return <OverviewPage />;
    case 2:
      return <CharacteristicsPage />;
    case 3:
      return <TravelBehaviorPage />;
    case 4:
      return <TravelObjectivesPage />;
    case 5:
      return <LengthOfStayPage />;
    case 6:
      return <ExpensesPage />;
    case 7:
      return <IncomeRevenuePage />;
    default:
      return <OverviewPage />;
  }
};

export function App() {
  return (
    <DashboardProvider>
      <DashboardLayout>
        <PageRenderer />
      </DashboardLayout>
    </DashboardProvider>
  );
}

export default App;
