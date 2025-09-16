/**
 * Dream Templates - Pre-defined dream goals with suggested amounts and timeframes
 * These templates help users quickly set up common financial goals
 */

export const dreamTemplates = [
  // Foundation Goals - Building financial security and stability
  {
    title: "Emergency Fund",
    description: "Build a solid financial safety net to protect yourself and your family from unexpected expenses. Having 3-6 months of living expenses saved provides peace of mind and financial security.",
    amount: 10000,
    suggestedTimeframe: 12,
    category: "Foundation Goals",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
  },
  {
    title: "Debt Freedom",
    description: "Break free from the burden of debt and reclaim your financial future. Pay off credit cards, student loans, and other debts to unlock your full earning potential.",
    amount: 15000,
    suggestedTimeframe: 18,
    category: "Foundation Goals",
    imageUrl: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=400&h=300&fit=crop"
  },
  {
    title: "First Investment Fund",
    description: "Start your wealth-building journey with your first investment portfolio. Begin with a diversified approach that sets the foundation for long-term financial growth.",
    amount: 5000,
    suggestedTimeframe: 8,
    category: "Foundation Goals",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop"
  },
  
  // Life Milestones - Important life events and transitions
  {
    title: "Dream Wedding",
    description: "Create the perfect celebration of your love story. From the venue and flowers to the dress and photography, plan the wedding of your dreams without compromising on your vision.",
    amount: 30000,
    suggestedTimeframe: 24,
    category: "Life Milestones",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop"
  },
  {
    title: "Home Purchase",
    description: "Make the leap from renting to owning with a substantial down payment. Secure your dream home and start building equity while creating a stable foundation for your family.",
    amount: 50000,
    suggestedTimeframe: 36,
    category: "Life Milestones",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
  },
  {
    title: "Kids College Fund",
    description: "Give your children the gift of education without the burden of debt. Start early to harness the power of compound interest and ensure their bright future.",
    amount: 25000,
    suggestedTimeframe: 60,
    category: "Life Milestones",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop"
  },
  {
    title: "New Car",
    description: "Get behind the wheel of your ideal vehicle with a substantial down payment. Lower your monthly payments and interest rates while driving off the lot with confidence.",
    amount: 12000,
    suggestedTimeframe: 14,
    category: "Life Milestones",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop"
  },
  
  // Someday Dreams - Ultimate lifestyle and aspiration goals
  {
    title: "European Adventure",
    description: "Explore the historic cities, stunning landscapes, and rich cultures of Europe. From the romantic canals of Venice to the vibrant streets of Barcelona, make your dream European vacation a reality.",
    amount: 15000,
    suggestedTimeframe: 18,
    category: "Someday Dreams",
    imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop"
  },
  {
    title: "Beach House",
    description: "Own your own slice of paradise with a coastal getaway home. Wake up to ocean views, enjoy sunset dinners on the deck, and create lifelong memories by the water.",
    amount: 150000,
    suggestedTimeframe: 120,
    category: "Someday Dreams",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"
  },
  {
    title: "Early Retirement",
    description: "Achieve financial independence and retire on your terms. Build enough wealth to live comfortably without depending on traditional employment income.",
    amount: 500000,
    suggestedTimeframe: 240,
    category: "Someday Dreams",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
  },
  {
    title: "Start a Business",
    description: "Turn your entrepreneurial dreams into reality. Cover startup costs, equipment, marketing, and initial operating expenses to launch your business venture with confidence.",
    amount: 20000,
    suggestedTimeframe: 16,
    category: "Someday Dreams",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
  }
];

/**
 * Get templates by category
 * @param {string} category - The category to filter by
 * @returns {Array} Filtered array of templates
 */
export const getTemplatesByCategory = (category) => {
  return dreamTemplates.filter(template => template.category === category);
};

/**
 * Get all unique categories
 * @returns {Array} Array of unique category names
 */
export const getCategories = () => {
  return [...new Set(dreamTemplates.map(template => template.category))];
};

/**
 * Get template by title
 * @param {string} title - The title to search for
 * @returns {Object|null} Template object or null if not found
 */
export const getTemplateByTitle = (title) => {
  return dreamTemplates.find(template => template.title === title) || null;
};

export default dreamTemplates;
