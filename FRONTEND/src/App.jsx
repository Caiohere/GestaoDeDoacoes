import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Doadores from './pages/Doadores';
import Doacoes from './pages/Doacoes';
import Ranking from './pages/Ranking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="doadores" element={<Doadores />} />
          <Route path="doacoes" element={<Doacoes />} />
          <Route path="ranking" element={<Ranking />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
