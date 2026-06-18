import './globals.css';
// 1. Add this import
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export const metadata = {
  title: 'Prosushil Field Tracker',
  description: 'Field Force Management',
};

export default function RootLayout({ children }) {
  // 2. Initialize the web camera elements safely on the client side
  if (typeof window !== 'undefined') {
    defineCustomElements(window);
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}