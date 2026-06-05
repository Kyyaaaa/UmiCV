import React from 'react';
import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">UmiCV</h1>
          <p className="mt-2 text-sm text-slate-500">Hệ thống Quản lý và Phê duyệt CV</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
