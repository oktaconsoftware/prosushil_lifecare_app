// import './globals.css';
// // 1. Add this import
// import { defineCustomElements } from '@ionic/pwa-elements/loader';

// export const metadata = {
//   title: 'Prosushil Field Tracker',
//   description: 'Field Force Management',
// };

// export default function RootLayout({ children }) {
//   // 2. Initialize the web camera elements safely on the client side
//   if (typeof window !== 'undefined') {
//     defineCustomElements(window);
//   }

//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }
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
              background: '#0a0f1c',
              color: '#fff',
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