
import '../styles/globals.css';

import React from 'react';

export const metadata = {
  title: 'Ops360',
  description: 'IT Asset & Ticketing MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
