import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import Requests from './pages/Requests';
import Canteen from './pages/Canteen';
import Library from './pages/Library';
import Sports from './pages/Sports';
import Store from './pages/Store';
import Assistant from './pages/Assistant';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/facilities/:id" element={<FacilityDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/canteen" element={<Canteen />} />
        <Route path="/library" element={<Library />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/store" element={<Store />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}