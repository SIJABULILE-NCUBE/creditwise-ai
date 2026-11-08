import React from 'react';
import { Routes, Route } from 'react-router';
import { S1Welcome } from './pages/S1Welcome';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<S1Welcome />} />
    </Routes>
  );
};

export default App;
