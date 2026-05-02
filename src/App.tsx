import React, { Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PermissionsProvider } from './lib/usePermissions';
import { Sidebar } from './components/Sidebar';
import { InstallPrompt } from './components/InstallPrompt';
import { AppRoutes } from './routes/AppRoutes';
import { Menu, Loader2 } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#5A5A40] text-white px-4 py-2 rounded-lg hover:bg-[#4A4A30] transition-colors"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
          <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
        </div>
      }>
        <AppRoutes />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 lg:ml-72 min-h-screen p-4 lg:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#5A5A40] via-[#6A6A50] to-[#5A5A40] p-6 rounded-3xl shadow-xl border border-white/20 backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/20 rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <img src="/logo.jpg" alt="Fre-Haymanot logo" className="w-8 h-8 rounded-xl object-cover shadow-md" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h2 className="font-serif font-bold text-white text-lg leading-tight drop-shadow-sm">
                    ፍሬ ሃይማኖት ሰ/ት/ቤት
                  </h2>
                  <p className="text-white/80 text-sm font-medium">አቴንዳንስ ስርዓት</p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="group relative p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Menu size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
              <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <PermissionsProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </PermissionsProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
