import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthProvider } from './lib/auth';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import Requests from './pages/Requests';
import RequestDetail from './pages/RequestDetail';
import Canteen from './pages/Canteen';
import Library from './pages/Library';
import Sports from './pages/Sports';
import Store from './pages/Store';
import Assistant from './pages/Assistant';
import AdminQueue from './pages/AdminQueue';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const protect = (el: ReactElement) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={protect(<Home />)} />
          <Route path="/facilities" element={protect(<Facilities />)} />
          <Route path="/facilities/:id" element={protect(<FacilityDetail />)} />
          <Route path="/requests" element={protect(<Requests />)} />
          <Route path="/requests/:id" element={protect(<RequestDetail />)} />
          <Route path="/canteen" element={protect(<Canteen />)} />
          <Route path="/library" element={protect(<Library />)} />
          <Route path="/sports" element={protect(<Sports />)} />
          <Route path="/store" element={protect(<Store />)} />
          <Route path="/assistant" element={protect(<Assistant />)} />
          <Route path="/admin" element={protect(<AdminQueue />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}