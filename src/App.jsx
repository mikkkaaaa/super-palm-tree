import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/home/home';
import BreakOut from './games/Breakout';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/breakout" element={<BreakOut />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
