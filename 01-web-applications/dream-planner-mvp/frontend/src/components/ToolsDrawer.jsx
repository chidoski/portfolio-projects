import React from 'react';
import { X, Calculator, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

const ToolsDrawer = ({ isOpen, onClose, onNavigate }) => {
  const tools = [
    {
      id: 'calculator',
      title: 'Dream Calculator',
      description: 'Calculate exactly how much to save daily, weekly, or monthly for any financial goal',
      icon: Calculator,
      color: 'blue',
      features: ['Goal breakdown', 'Time estimates', 'Savings targets'],
      action: () => onNavigate('calculator')
    },
    {
      id: 'spending-demo',
      title: 'Spending Decision Helper',
      description: 'See how small daily decisions compound into life-changing amounts over time',
      icon: TrendingUp,
      color: 'green',
      features: ['Cost visualization', 'Compound effects', 'Decision insights'],
      action: () => onNavigate('spendingdemo')
    },
    {
      id: 'income-accelerator',
      title: 'Income Accelerator',
      description: 'Explore strategies to increase your income and accelerate your financial goals',
      icon: DollarSign,
      color: 'purple',
      features: ['Income strategies', 'Growth planning', 'Goal acceleration'],
      action: () => onNavigate('incomeaccelerator')
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Explore Tools</h2>
            <p className="text-sm text-gray-600 mt-1">Financial planning utilities</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full pb-24">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            
            return (
              <div
                key={tool.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                onClick={tool.action}
              >
                {/* Tool Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-${tool.color}-100 mr-4 group-hover:bg-${tool.color}-200 transition-colors`}>
                      <IconComponent className={`w-6 h-6 text-${tool.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                        {tool.title}
                      </h3>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                {/* Tool Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {tool.description}
                </p>

                {/* Tool Features */}
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 bg-${tool.color}-50 text-${tool.color}-700 text-xs rounded-full border border-${tool.color}-200`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Hover Effect */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className={`text-${tool.color}-600 text-sm font-medium flex items-center`}>
                    Try this tool
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-gray-500 text-xs mb-2">💡 Pro Tip</div>
            <p className="text-gray-700 text-sm">
              These tools work great alongside your Someday Life planning to explore different scenarios and optimize your financial strategy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolsDrawer;
