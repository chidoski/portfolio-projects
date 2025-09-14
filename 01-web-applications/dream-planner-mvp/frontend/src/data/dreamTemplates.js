/**
 * Dream Templates - Pre-defined dream goals with suggested amounts and timeframes
 * These templates help users quickly set up common financial goals
 */

export const dreamTemplates = [
  {
    title: "European Adventure",
    description: "Explore the historic cities, stunning landscapes, and rich cultures of Europe. From the romantic canals of Venice to the vibrant streets of Barcelona, make your dream European vacation a reality.",
    amount: 15000,
    suggestedTimeframe: 18,
    category: "Travel",
    imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop"
  },
  {
    title: "Emergency Fund",
    description: "Build a solid financial safety net to protect yourself and your family from unexpected expenses. Having 3-6 months of living expenses saved provides peace of mind and financial security.",
    amount: 10000,
    suggestedTimeframe: 12,
    category: "Financial Security",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
  },
  {
    title: "Dream Wedding",
    description: "Create the perfect celebration of your love story. From the venue and flowers to the dress and photography, plan the wedding of your dreams without compromising on your vision.",
    amount: 30000,
    suggestedTimeframe: 24,
    category: "Life Events",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop"
  },
  {
    title: "New Car Down Payment",
    description: "Get behind the wheel of your ideal vehicle with a substantial down payment. Lower your monthly payments and interest rates while driving off the lot with confidence.",
    amount: 8000,
    suggestedTimeframe: 10,
    category: "Transportation",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop"
  },
  {
    title: "Home Renovation",
    description: "Transform your living space into the home of your dreams. Whether it's a kitchen remodel, bathroom upgrade, or whole-house renovation, create a space that reflects your style and needs.",
    amount: 25000,
    suggestedTimeframe: 20,
    category: "Home Improvement",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop"
  },
  {
    title: "Start a Business",
    description: "Turn your entrepreneurial dreams into reality. Cover startup costs, equipment, marketing, and initial operating expenses to launch your business venture with confidence.",
    amount: 20000,
    suggestedTimeframe: 16,
    category: "Business",
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
