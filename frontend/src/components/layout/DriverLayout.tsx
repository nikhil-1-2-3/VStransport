import React from 'react';
import { Outlet } from 'react-router-dom';

export const DriverLayout: React.FC = () => {
  return (
    <div className="driver-layout-root" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <Outlet />
    </div>
  );
};
