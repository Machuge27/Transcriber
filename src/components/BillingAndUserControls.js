import React, { useState, useEffect } from 'react';
import { 
  LogOutIcon, 
  ContactIcon, 
  CreditCardIcon, 
  ClockIcon, 
  CalendarIcon,
  CheckIcon,
  StarIcon,
  ZapIcon,
  ShoppingCartIcon,
  BadgeCheckIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';

const BillingAndUserControls = () => {
  const { token, theme, setTheme, logout } = useAuth();
  const [billingInfo, setBillingInfo] = useState({
    dailyTokens: 0,
    weeklyTokens: 0,
    monthlyTokens: 0,
    dailyLimit: 1000,
    weeklyLimit: 7000,
    monthlyLimit: 30000,
    currentPlan: 'basic' // basic, premium, or null
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

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
      background: 'bg-gray-200',
      text: 'text-gray-800',
      card: 'bg-white',
      progressBackground: 'bg-gray-300',
      progressFill: 'bg-green-500',
      basicCard: 'bg-white border-blue-200 shadow-blue-100',
      premiumCard: 'bg-white border-purple-200 shadow-purple-100',
      activeTab: 'bg-indigo-100 text-indigo-800'
    },
    dark: {
      background: 'bg-gray-800',
      text: 'text-gray-100',
      card: 'bg-gray-700',
      progressBackground: 'bg-gray-700',
      progressFill: 'bg-green-600',
      basicCard: 'bg-gray-700 border-blue-800 shadow-blue-900',
      premiumCard: 'bg-gray-700 border-purple-800 shadow-purple-900',
      activeTab: 'bg-indigo-900 text-indigo-200'
    },
    sepia: {
      background: 'bg-[#E7DFC6]',
      text: 'text-gray-800',
      card: 'bg-[#F4ECD8]',
      progressBackground: 'bg-[#D4C6A8]',
      progressFill: 'bg-green-700',
      basicCard: 'bg-[#F4ECD8] border-blue-200 shadow-blue-100',
      premiumCard: 'bg-[#F4ECD8] border-purple-200 shadow-purple-100',
      activeTab: 'bg-[#D4C6A8] text-indigo-800'
    }
  };

  const currentTheme = themes[theme];

  const plans = {
    basic: {
      name: "Basic",
      icon: <BadgeCheckIcon className="w-5 h-5 text-blue-500" />,
      cardClass: currentTheme.basicCard,
      color: "blue",
      features: [
        "500 minutes of transcription per month",
        "Basic editing features",
        "2 export formats",
        "Email support"
      ],
      pricing: {
        daily: 1.99,
        weekly: 9.99,
        monthly: 29.99
      }
    },
    premium: {
      name: "Premium",
      icon: <StarIcon className="w-5 h-5 text-purple-500" />,
      cardClass: currentTheme.premiumCard,
      color: "purple",
      features: [
        "Unlimited transcription minutes",
        "Advanced editing tools",
        "All export formats",
        "Priority support",
        "Custom vocabulary"
      ],
      pricing: {
        daily: 4.99,
        weekly: 19.99,
        monthly: 59.99
      }
    }
  };

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
          className={`flex items-center justify-center p-2 rounded hover:${currentTheme.background} transition-colors ${currentTheme.text}`}
        >
          <ContactIcon className="w-5 h-5 mr-2" />
          Contact Support
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-xl w-96 ${currentTheme.card} ${currentTheme.text}`}>
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

  const PurchaseModal = () => {
    if (!showPurchaseModal) return null;
    
    const plan = plans[selectedPlan];
    const price = selectedDuration ? plan.pricing[selectedDuration] : null;
    
    // Get duration in readable format
    const getDurationText = (duration) => {
      switch(duration) {
        case 'daily': return '1 day';
        case 'weekly': return '7 days';
        case 'monthly': return '30 days';
        default: return '';
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg shadow-xl w-96 ${currentTheme.card} ${currentTheme.text}`}>
          <h2 className="text-xl font-bold mb-4">Confirm Your Purchase</h2>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              {plan.icon}
              <span className="text-lg font-semibold ml-2">{plan.name} Plan</span>
            </div>
            <p className="mb-2">Duration: {getDurationText(selectedDuration)}</p>
            <p className="text-xl font-bold text-green-600">${price}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <div className="flex justify-between mb-1">
              <span>{plan.name} Plan ({getDurationText(selectedDuration)})</span>
              <span>${price}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${price}</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                // Handle purchase logic here
                setShowPurchaseModal(false);
                alert(`Thank you for purchasing the ${plan.name} plan for ${getDurationText(selectedDuration)}!`);
              }}
              className={`px-4 py-2 bg-${plan.color}-600 text-white rounded hover:bg-${plan.color}-700`}
            >
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PlanCard = ({ planType }) => {
    const plan = plans[planType];
    const [selectedTab, setSelectedTab] = useState("monthly");
    
    // Check if this is the current plan
    const isCurrentPlan = billingInfo.currentPlan === planType;
    
    return (
      <div className={`p-4 rounded-lg border-2 shadow-md mb-4 ${plan.cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {plan.icon}
            <h3 className="text-lg font-bold ml-2">{plan.name}</h3>
          </div>
          {isCurrentPlan && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <CheckIcon className="w-3 h-3 mr-1" /> Current
            </span>
          )}
        </div>
        
        {/* Features */}
        <ul className="mb-4 space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className={`w-4 h-4 mr-2 mt-0.5 text-${plan.color}-500`} />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Pricing Tabs */}
        <div className="mb-4">
          <div className="flex mb-2 rounded overflow-hidden border divide-x">
            {["daily", "weekly", "monthly"].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedTab(duration)}
                className={`flex-1 px-2 py-1 text-xs transition-colors ${
                  selectedTab === duration 
                    ? currentTheme.activeTab
                    : "bg-transparent"
                }`}
              >
                {duration.charAt(0).toUpperCase() + duration.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold">${plan.pricing[selectedTab]}</span>
              <span className="text-sm ml-1">
                /{selectedTab === "daily" ? "day" : selectedTab === "weekly" ? "week" : "month"}
              </span>
            </div>
            
            <button
              onClick={() => {
                setSelectedPlan(planType);
                setSelectedDuration(selectedTab);
                setShowPurchaseModal(true);
              }}
              className={`px-3 py-1 rounded text-white text-sm flex items-center bg-${plan.color}-600 hover:bg-${plan.color}-700`}
            >
              <ShoppingCartIcon className="w-4 h-4 mr-1" />
              {isCurrentPlan ? "Renew" : "Purchase"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-0 mt-5 h-full bg-transparent ${currentTheme.text}`}>
      <h3 className="text-xl font-bold mt-4 border-b-2 border-gray-300 mb-6">Usage & Subscription</h3>
      
      <div  className='overflow-y-auto h-[40rem]'>
        {/* Billing Progress Indicators */}
        <div className="mb-6 pr-4">
          <h4 className="text-lg font-semibold mb-4 flex items-center border-b border-gray-300">
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
        
        {/* Subscription Plans */}
        <div className="mb-6 pr-3">
          {/* Header Section */}
          <h4 className="text-lg font-semibold mb-4 flex items-center border-b border-gray-300 justify-between">
            <span className="flex items-center">
              <ZapIcon className="w-5 h-5 mr-2" />
              Subscription Plans
            </span>

            {/* Eye Icon for Toggle */}
            <button onClick={() => setIsVisible(!isVisible)} className="text-gray-400 hover:text-gray-200 transition mr-2">
              {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </h4>

          {/* Subscription Cards with Animation */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, height: isVisible ? "auto" : 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <PlanCard planType="basic" />
            <PlanCard planType="premium" />
          </motion.div>
          <ContactModal />
          {/* User Controls */}
          <div className={`justify-items-start text-left sticky rounded bottom-0 ${currentTheme.background}`}>
          
          <button 
            onClick={logout}
            className={`flex items-center justify-start p-2 rounded hover:bg-red-100 text-red-600 transition-colors`}
          >
            <LogOutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
          <div className="relative z-10 m-0 p-2 text-gray-400 text-sm">
            © {new Date().getFullYear()} AI Transcriber. All Rights Reserved.
          </div>
          </div>
        </div>
  
              
        {/* Purchase Modal */}
        <PurchaseModal />
      </div>
    </div>
  );
};

export default BillingAndUserControls;