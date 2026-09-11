import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { MobileNav } from '../components/common/MobileNav';
import { NotificationDrawer } from '../components/common/NotificationDrawer';
import { AboutModal } from '../components/common/AboutModal';
import { ShieldCheck, Heart } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#D4D4D8] dark:bg-[#0A0A0A] dark:text-[#D4D4D8] flex flex-col transition-colors">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAbout={() => setAboutOpen(true)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenAbout={() => setAboutOpen(true)}
        />

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Institutional Footer with Developer Credit */}
        <footer className="border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0D0D0F]/80 py-4 px-4 sm:px-8 text-xs text-zinc-500 hidden lg:flex items-center justify-between backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif text-zinc-300">
              Smart Student Management System
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500">Apex Institute of Technology</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAboutOpen(true)}
              className="hover:text-[#C4A484] transition-colors cursor-pointer"
            >
              System Info
            </button>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1">
              <span>Developed by</span>
              <span className="font-serif text-[#C4A484]">Sonam Pal</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Notification Drawer Modal */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* About System Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
};
