import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { Messages, CustomerService } from './pages/Communication';
import { InvitationRecords, JobManagement, MyFavorites, Memo } from './pages/Recruitment';
import { PersonalData, TeamData, InterviewData } from './pages/DataViz';
import { InterviewManagement } from './pages/InterviewManagement';
import { PersonalCenter, OrgChart, EnterpriseSettings, SystemManagement } from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return token ? children : null;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/customer-service" element={<PrivateRoute><CustomerService /></PrivateRoute>} />
      <Route path="/invitation" element={<PrivateRoute><InvitationRecords /></PrivateRoute>} />
      <Route path="/job-management" element={<PrivateRoute><JobManagement /></PrivateRoute>} />
      <Route path="/my-favorites" element={<PrivateRoute><MyFavorites /></PrivateRoute>} />
      <Route path="/memo" element={<PrivateRoute><Memo /></PrivateRoute>} />
      <Route path="/personal-data" element={<PrivateRoute><PersonalData /></PrivateRoute>} />
      <Route path="/team-data" element={<PrivateRoute><TeamData /></PrivateRoute>} />
      <Route path="/interview-data" element={<PrivateRoute><InterviewData /></PrivateRoute>} />
      <Route path="/interview-management" element={<PrivateRoute><InterviewManagement /></PrivateRoute>} />
      <Route path="/personal-center" element={<PrivateRoute><PersonalCenter /></PrivateRoute>} />
      <Route path="/org-chart" element={<PrivateRoute><OrgChart /></PrivateRoute>} />
      <Route path="/enterprise-settings" element={<PrivateRoute><EnterpriseSettings /></PrivateRoute>} />
      <Route path="/system-management" element={<PrivateRoute><SystemManagement /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
