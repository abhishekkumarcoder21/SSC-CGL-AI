import './globals.css';
import { UserProvider } from './context/UserContext';
import BottomNav from './components/BottomNav';

export const metadata = {
  title: 'SSC CGL AI — Your Personal Exam Mentor',
  description: 'AI-powered study planner, mock analyzer, and performance tracker for SSC CGL aspirants.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0a0e17',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0e17" />
      </head>
      <body>
        <UserProvider>
          <div className="app-shell">
            <header className="app-header">
              <div className="logo">SSC CGL <span>AI</span></div>
            </header>
            <main className="page-content">
              {children}
            </main>
            <BottomNav />
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
