import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeProvider';
import BottomNav from './components/BottomNav';
import NotificationPrompt from './components/NotificationPrompt';
import ThemeToggle from './components/ThemeToggle';
import ProfileAvatar from './components/ProfileAvatar';

export const metadata = {
  title: 'SSC CGL AI — Your Personal Exam Mentor',
  description: 'AI-powered study planner, mock analyzer, and performance tracker for SSC CGL aspirants.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0e17" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        {/* Prevent flash of light theme */}
        <script dangerouslySetInnerHTML={{
          __html: `
          try { document.documentElement.setAttribute('data-theme', localStorage.getItem('ssc_theme') || 'dark'); } catch(e) {}
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <div className="app-shell">
                <header className="app-header">
                  <div className="logo">SSC CGL <span>AI</span></div>
                  <div className="header-actions">
                    <ThemeToggle />
                    <ProfileAvatar />
                  </div>
                </header>
                <main className="page-content">
                  {children}
                </main>
                <BottomNav />
                <NotificationPrompt />
              </div>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
