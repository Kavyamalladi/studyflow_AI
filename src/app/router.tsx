import { Routes, Route } from 'react-router-dom';
import { ProductWorkspacePage } from '@/pages';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductWorkspacePage />} />
      <Route path="/workspace" element={<ProductWorkspacePage />} />
    </Routes>
  );
}
