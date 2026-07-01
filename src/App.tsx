import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { InventoryList } from './pages/InventoryList';
import { AddStock } from './pages/AddStock';
import { Categories } from './pages/Categories';
import { PlaceOrder } from './pages/PlaceOrder';
import { inventoryApi } from './services/api';

function App() {
  useEffect(() => {
    // Initialize Mock DB in localStorage
    inventoryApi.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="add-stock" element={<AddStock />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<PlaceOrder />} />
          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
