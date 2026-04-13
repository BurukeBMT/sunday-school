import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt
            setShowPrompt(true);
        };

        const handleAppInstalled = () => {
            // Hide the install prompt
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        // Reset the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Store dismissal in localStorage to not show again
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if already dismissed
    if (localStorage.getItem('pwa-install-dismissed') === 'true') {
        return null;
    }

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                    <Download size={80} className="text-gray-300" />
                </div>

                <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#5A5A40] to-[#4A4A30] rounded-2xl flex items-center justify-center shadow-lg">
                                <Download size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#1a1a1a]">Install App</h3>
                                <p className="text-sm text-gray-500">Add to Home Screen</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                        Install our app for a better experience with offline access and faster loading.
                    </p>

                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-gradient-to-r from-[#5A5A40] to-[#4A4A30] text-white py-3 rounded-2xl font-bold hover:from-[#4A4A30] hover:to-[#3A3A20] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Install Now
                    </button>
                </div>
            </div>
        </div>
    );
};