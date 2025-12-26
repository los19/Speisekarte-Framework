import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useConfig, useFeatures, ConfigProvider } from './config/ConfigProvider';
import { MenuPage } from './pages/MenuPage';
import { HomePage } from './pages/HomePage';
import './styles/index.css';

function AppRouter() {
  const { isLoading, error } = useConfig();
  const features = useFeatures();

  if (isLoading) {
    return (
      <div className="app-loading">
        <p>Wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Fehler beim Laden</h2>
        <p>{error}</p>
      </div>
    );
  }

  // If website mode is disabled, show menu page directly
  if (!features.enableWebsite) {
    return <MenuPage />;
  }

  // Multi-page mode: separate routes for home and menu
  if (features.websiteMode === 'multiPage') {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/speisekarte" element={<MenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // One-pager mode: single page with all sections
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppWithRouter() {
  const { isLoading, error } = useConfig();
  const features = useFeatures();

  if (isLoading) {
    return (
      <div className="app-loading">
        <p>Wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Fehler beim Laden</h2>
        <p>{error}</p>
      </div>
    );
  }

  // If website mode is disabled, no router needed
  if (!features.enableWebsite) {
    return <MenuPage />;
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

// Main App component with ConfigProvider included
function App() {
  return (
    <ConfigProvider>
      <AppWithRouter />
    </ConfigProvider>
  );
}

export default App;
