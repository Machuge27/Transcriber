import React, { useState, useEffect } from 'react';
import { 
  LogOutIcon, 
  ContactIcon, 
  CreditCardIcon, 
  ClockIcon, 
  CalendarIcon 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BillingAndUserControls = () => {
  const { token, theme, setTheme, logout } = useAuth();
  const [billingInfo, setBillingInfo] = useState({
    dailyTokens: 0,
    weeklyTokens: 0,
    monthlyTokens: 0,
    dailyLimit: 1000,
    weeklyLimit: 7000,
    monthlyLimit: 30000
  });

  // Mock billing data fetch (replace with actual API call)
  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/billing', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setBillingInfo(data);
      } catch (error) {
        console.error('Failed to fetch billing info', error);
      }
    };

    fetchBillingInfo();
  }, [token]);

  const themes = {
    light: {
      background: 'bg-gray-100',
      text: 'text-gray-800',
      progressBackground: 'bg-gray-300',
      progressFill: 'bg-green-500'
    },
    dark: {
      background: 'bg-gray-800',
      text: 'text-gray-100',
      progressBackground: 'bg-gray-700',
      progressFill: 'bg-green-600'
    },
    sepia: {
      background: 'bg-[#E7DFC6]',
      text: 'text-gray-800',
      progressBackground: 'bg-[#D4C6A8]',
      progressFill: 'bg-green-700'
    }
  };

  const currentTheme = themes[theme];

  const ProgressBar = ({ current, limit, label, icon: Icon }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-xs font-semibold">
          {current} / {limit}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${currentTheme.progressBackground}`}>
        <div 
          className={`h-full rounded-full ${currentTheme.progressFill}`}
          style={{ 
            width: `${Math.min(100, (current / limit) * 100)}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        ></div>
      </div>
    </div>
  );

  const ContactModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button 
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-center p-2 rounded hover:bg-gray-200 transition-colors ${currentTheme.text}`}
        >
          <ContactIcon className="w-5 h-5 mr-2" />
          Contact Support
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-xl w-96 ${currentTheme.background} ${currentTheme.text}`}>
              <h2 className="text-xl font-bold mb-4">Contact Support</h2>
              <p className="mb-4">Need help? Reach out to our support team:</p>
              <div className="space-y-2">
                <p>📧 Email: support@transcriptionapp.com</p>
                <p>📞 Phone: +1 (888) 123-4567</p>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`p-4 ${currentTheme.background} ${currentTheme.text}`}>
      <h3 className="text-xl font-bold mb-6">Usage & Controls</h3>
      
      {/* Billing Progress Indicators */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2" />
          Token Usage
        </h4>
        <ProgressBar 
          current={billingInfo.dailyTokens} 
          limit={billingInfo.dailyLimit} 
          label="Daily" 
          icon={ClockIcon}
        />
        <ProgressBar 
          current={billingInfo.weeklyTokens} 
          limit={billingInfo.weeklyLimit} 
          label="Weekly" 
          icon={CalendarIcon}
        />
        <ProgressBar 
          current={billingInfo.monthlyTokens} 
          limit={billingInfo.monthlyLimit} 
          label="Monthly" 
          icon={CalendarIcon}
        />
      </div>

      {/* User Controls */}
      <div className="space-y-2">
        <ContactModal />
        
        <button 
          onClick={logout}
          className={`w-full flex items-center justify-center p-2 rounded hover:bg-red-100 text-red-600 transition-colors`}
        >
          <LogOutIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default BillingAndUserControls;