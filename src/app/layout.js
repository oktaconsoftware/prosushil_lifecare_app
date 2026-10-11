
import './globals.css';
import PwaInit from './PwaInit';
import { Toaster } from 'react-hot-toast';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', 
};

export const metadata = {
  title: 'Prosushil Lifecare | Field Force Tracker',
  description: 'Official Field Force Management and GPS Tracking system for Prosushil Lifecare.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
      {/* 🚨 FIX: containerStyle pushes the toast below the status bar and header */}
        <Toaster
          position="top-center"
          containerStyle={{
            top: 85, // 85px clears both the Android status bar and your top header
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fcfffb',
              color: '#002718',
              fontSize: '13px',
              borderRadius: '12px',
            },
          }}
        />
        <PwaInit />
        {children}
      </body>
    </html>
  );
}