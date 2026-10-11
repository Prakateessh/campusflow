import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthProvider, type Role } from './lib/auth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
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

// Roles for each protected route
const LAB_ROLES: Role[] = ['student', 'faculty', 'technician', 'admin'];
const REQUEST_ROLES: Role[] = ['student', 'faculty', 'technician', 'admin'];
const CANTEEN_ROLES: Role[] = ['student', 'faculty', 'service_provider', 'admin'];
const LIBRARY_ROLES: Role[] = ['student', 'faculty', 'service_provider', 'admin'];
const SPORTS_ROLES: Role[] = ['student', 'faculty', 'admin'];
const STORE_ROLES: Role[] = ['student', 'faculty', 'admin'];
const ASSISTANT_ROLES: Role[] = ['student', 'faculty', 'admin'];
const ADMIN_ROLES: Role[] = ['faculty', 'technician', 'service_provider', 'admin'];

const guard = (el: ReactElement, allow: Role[]) => (
  <RequireAuth>
    <RequireRole allow={allow}>{el}</RequireRole>
  </RequireAuth>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/facilities" element={guard(<Facilities />, LAB_ROLES)} />
          <Route path="/facilities/:id" element={guard(<FacilityDetail />, LAB_ROLES)} />
          <Route path="/requests" element={guard(<Requests />, REQUEST_ROLES)} />
          <Route path="/requests/:id" element={guard(<RequestDetail />, REQUEST_ROLES)} />
          <Route path="/canteen" element={guard(<Canteen />, CANTEEN_ROLES)} />
          <Route path="/library" element={guard(<Library />, LIBRARY_ROLES)} />
          <Route path="/sports" element={guard(<Sports />, SPORTS_ROLES)} />
          <Route path="/store" element={guard(<Store />, STORE_ROLES)} />
          <Route path="/assistant" element={guard(<Assistant />, ASSISTANT_ROLES)} />
          <Route path="/admin" element={guard(<AdminQueue />, ADMIN_ROLES)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}