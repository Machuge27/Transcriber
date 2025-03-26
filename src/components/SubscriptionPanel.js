import React, { useState } from 'react';
import { 
  CheckIcon, 
  ZapIcon, 
  CrownIcon 
} from 'lucide-react';

const SubscriptionPlan = ({ 
  name, 
  price, 
  features, 
  isPopular = false, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      className={`
        relative rounded-xl p-5 transition-all duration-300 
        ${isSelected 
          ? 'bg-indigo-600/20 border-2 border-indigo-600' 
          : 'bg-[#1E2A3A] hover:bg-[#263242]'}
        flex flex-col justify-between
      `}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 m-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
          Most Popular
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center text-white">
            {name === 'Pro' && <ZapIcon className="w-5 h-5 mr-2 text-indigo-400" />}
            {name === 'Enterprise' && <CrownIcon className="w-5 h-5 mr-2 text-yellow-500" />}
            {name}
          </h3>
          <div className="text-2xl font-bold text-indigo-400">
            ${price}
            <span className="text-sm text-gray-400 ml-1">/mo</span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300">
              <CheckIcon className="w-5 h-5 mr-2 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={onSelect}
        className={`
          w-full py-3 rounded-lg transition-colors 
          ${isSelected 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-[#263242] text-white hover:bg-[#2C3E50]'}
        `}
      >
        {isSelected ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

const SubscriptionPanel = () => {
  const [selectedPlan, setSelectedPlan] = useState('Pro');

  const plans = [
    {
      name: 'Basic',
      price: 9,
      features: [
        '100 Transcription Minutes/Month',
        'Basic Markdown Editing',
        'Standard Audio Formats',
        'Email Support'
      ]
    },
    {
      name: 'Pro',
      price: 29,
      features: [
        '500 Transcription Minutes/Month',
        'Advanced Markdown Tools',
        'All Audio Formats',
        'Priority Email Support',
        'Collaboration Features'
      ],
      isPopular: true
    },
    {
      name: 'Enterprise',
      price: 99,
      features: [
        'Unlimited Transcription Minutes',
        'Custom Markdown Extensions',
        'All Audio Formats',
        '24/7 Dedicated Support',
        'Team Collaboration',
        'Custom Integrations'
      ]
    }
  ];

  return (
    <div className="bg-[#0F172A] text-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Subscription & Billing</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <SubscriptionPlan
            key={plan.name}
            {...plan}
            isSelected={selectedPlan === plan.name}
            onSelect={() => setSelectedPlan(plan.name)}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
          Update Subscription
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPanel;