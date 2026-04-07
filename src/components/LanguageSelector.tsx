import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value as Language);
    };

    return (
        <div className="language-selector">
            <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
            </select>
        </div>
    );
};

export default LanguageSelector;