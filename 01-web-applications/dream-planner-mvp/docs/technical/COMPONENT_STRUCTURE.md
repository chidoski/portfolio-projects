# Component Structure - Dream Planner Frontend

## Component Architecture Overview

The Dream Planner frontend follows atomic design principles, building from small, reusable components up to complete pages. This approach ensures consistency across the application while making development faster and maintenance easier. Think of it like building with LEGO blocks where simple pieces combine to create complex structures.

The component hierarchy moves from atoms (the smallest building blocks like buttons and inputs) through molecules (combinations of atoms like a form field with label) to organisms (complex components like a complete dream card) and finally to templates and pages. Each level adds functionality while maintaining clear separation of concerns.

## Atoms - Basic Building Blocks

### Button Component
```typescript
// src/components/atoms/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```
The Button component serves as the foundation for all interactive actions in the application. The primary variant uses warm coral tones for main actions like "Create Dream" or "Save Progress." The secondary variant provides a subtle alternative for less important actions, while the ghost variant offers minimal styling for tertiary actions. When loading is true, the button shows a spinner and disables interaction, maintaining the same size to prevent layout shifts.

### ProgressBar Component
```typescript
// src/components/atoms/ProgressBar.tsx
interface ProgressBarProps {
  value: number; // 0-100
  color?: 'green' | 'yellow' | 'blue';
  animated?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```
The ProgressBar visualizes achievement toward goals with smooth animations and encouraging colors. Green indicates on-track progress, yellow suggests slight delays without creating anxiety, and blue celebrates being ahead of schedule. The animated prop adds a subtle pulsing effect for active goals, drawing attention without being distracting. The component uses CSS transitions for smooth value changes, making progress feel continuous rather than stepped.

### Input Component
```typescript
// src/components/atoms/Input.tsx
interface InputProps {
  type: 'text' | 'number' | 'currency' | 'date';
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  icon?: React.ReactNode;
  formatOptions?: object;
}
```
The Input component handles all user data entry with built-in validation and formatting. The currency type automatically formats numbers with commas and dollar signs as users type, making large amounts easier to read. Date inputs integrate with a calendar picker for intuitive date selection. Error states appear with gentle red highlighting and helpful messages below the field, maintaining an encouraging tone even when corrections are needed.

### Card Component
```typescript
// src/components/atoms/Card.tsx
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}
```
The Card component provides consistent container styling throughout the application. When hover is enabled, cards lift slightly on mouse-over with a subtle shadow increase, creating depth and interactivity. The clickable variant adds cursor pointer and active states for cards that trigger actions. This component forms the foundation for dream cards, progress summaries, and goal displays.

## Molecules - Combined Components

### DreamCard Component
```typescript
// src/components/molecules/DreamCard.tsx
interface DreamCardProps {
  dream: {
    id: number;
    title: string;
    imageUrl: string;
    targetAmount: number;
    targetDate: Date;
    currentProgress: number;
    category: DreamCategory;
  };
  onClick?: (dreamId: number) => void;
  variant?: 'compact' | 'detailed';
}
```
The DreamCard combines multiple atoms to create an emotionally engaging display of user dreams. The compact variant shows on the timeline with just the image, title, and progress ring, optimizing for scannability. The detailed variant appears in the dashboard with full information including daily savings amount and days remaining. The image uses object-fit cover to maintain aspect ratio while filling the space beautifully. Hover states reveal additional quick actions like edit or pause without navigating away.

### GoalInput Component
```typescript
// src/components/molecules/GoalInput.tsx
interface GoalInputProps {
  label: string;
  currentAmount: number;
  targetAmount: number;
  onAmountChange: (amount: number) => void;
  period: 'daily' | 'weekly' | 'monthly';
  comparison?: string; // "That's 2 coffees"
}
```
The GoalInput molecule combines an Input atom with contextual information to make saving amounts relatable. As users adjust the amount, the comparison updates in real-time to maintain relevance. For example, $5 might show "one coffee" while $50 shows "one restaurant meal." The component includes a subtle progress indicator showing how this amount contributes to the overall goal, maintaining context while focusing on the immediate action.

### TimelineNode Component
```typescript
// src/components/molecules/TimelineNode.tsx
interface TimelineNodeProps {
  position: number; // 0-100 representing position on timeline
  dream: Dream;
  isActive?: boolean;
  onDrag?: (newPosition: number) => void;
  connectionLine?: 'left' | 'right' | 'both';
}
```
The TimelineNode represents a dream on the timeline with rich interactivity. The node displays as a circular image thumbnail that expands on hover to show dream details. When dragging is enabled, users can reposition dreams to different dates with smooth animation and real-time recalculation feedback. Connection lines link nodes to create a visual journey from present to future. The active state highlights the currently selected dream with a pulsing glow effect.

### ProgressRing Component
```typescript
// src/components/molecules/ProgressRing.tsx
interface ProgressRingProps {
  percentage: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  displayValue?: string;
  animated?: boolean;
  color?: string;
}
```
The ProgressRing creates circular progress indicators using SVG for crisp rendering at any size. The ring fills clockwise from the top with smooth animation when values change. The center can display percentage, dollar amount, or days remaining depending on context. For the hero dashboard metric, the XL size creates an impressive focal point that immediately communicates overall progress. The animated prop adds a subtle rotation effect for active savings periods.

## Organisms - Complex Components

### DreamBuilder Component
```typescript
// src/components/organisms/DreamBuilder.tsx
interface DreamBuilderProps {
  onDreamCreate: (dream: DreamInput) => void;
  categories: DreamCategory[];
  suggestions?: DreamSuggestion[];
}
```
The DreamBuilder orchestrates the entire dream creation experience, managing form state, validation, and real-time calculations. The component guides users through dream creation with progressive disclosure, starting with inspiring the dream title and amount, then adding details like dates and images. As users input values, the breakdown calculator updates below the form showing daily, weekly, and monthly amounts with relatable comparisons. The image selection offers both upload and gallery options with a beautiful grid of curated photos organized by category. Form validation happens on blur rather than on type to avoid frustrating users mid-thought.

### Timeline Component
```typescript
// src/components/organisms/Timeline.tsx
interface TimelineProps {
  dreams: Dream[];
  onDreamSelect: (dreamId: number) => void;
  onDreamReorder: (dreamId: number, newDate: Date) => void;
  viewRange: 'year' | '5years' | 'all';
  currentDate: Date;
}
```
The Timeline creates an interactive visualization of all user dreams across time. The component uses a horizontal layout with smooth scrolling and pinch-to-zoom on touch devices. Time markers appear at intelligent intervals based on the zoom level, showing months when zoomed in or years when viewing the full range. Dreams appear as nodes connected by a flowing line that represents the savings journey. The current date marker shows "You are here" with a subtle animation drawing attention to the present moment. Dragging dreams to new dates triggers smooth recalculation animations showing how the change affects savings requirements.

### Dashboard Component
```typescript
// src/components/organisms/Dashboard.tsx
interface DashboardProps {
  user: User;
  dreams: Dream[];
  weeklyGoals: Goal[];
  monthlyProgress: ProgressData;
  streaks: StreakData;
}
```
The Dashboard serves as the command center for user progress, providing both overview and detail in a scannable layout. The hero section features a large progress ring showing total savings across all dreams with encouraging messaging that adapts to performance. Below this, dream cards arrange in a responsive grid, each showing individual progress with quick actions. The "This Week" section focuses attention on immediate goals with daily checkboxes and a filling progress bar. The streak counter celebrates consistency without punishing breaks, using "streak insurance" to maintain motivation through life's disruptions.

### WeeklyCheckIn Component
```typescript
// src/components/organisms/WeeklyCheckIn.tsx
interface WeeklyCheckInProps {
  weekGoals: Goal[];
  currentProgress: number;
  onProgressLog: (amount: number, note?: string) => void;
  onGoalAdjust: (newAmount: number) => void;
  encouragementStyle: 'supportive' | 'celebratory' | 'neutral';
}
```
The WeeklyCheckIn creates a ritual around progress tracking that feels rewarding rather than burdensome. The component opens with celebration or encouragement based on current performance, using confetti animations for goal achievement or gentle support for weeks that didn't go as planned. Users can quickly log their actual savings with preset quick-add buttons or custom amounts. If behind on goals, the component offers three recovery options: redistribute the gap across future weeks, extend the timeline slightly, or mark this week as an exception and start fresh. The tone remains supportive throughout, acknowledging that perfect execution is unrealistic.

## Templates - Layout Components

### AppLayout Component
```typescript
// src/components/templates/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  backgroundVariant?: 'gradient' | 'solid' | 'pattern';
}
```
The AppLayout provides consistent structure across all pages with a responsive navigation system that adapts from desktop sidebar to mobile bottom bar. The gradient background creates visual interest without distraction, using subtle animations that shift colors based on time of day. The layout maintains proper spacing and maximum widths to ensure readability on large screens while utilizing full width on mobile devices.

### OnboardingLayout Component
```typescript
// src/components/templates/OnboardingLayout.tsx
interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
}
```
The OnboardingLayout creates a focused experience for new users with progress indication and smooth transitions between steps. The template removes navigation distractions while maintaining brand presence through consistent styling. Step transitions use sliding animations that respect the user's motion preferences, disabling animation for users who prefer reduced motion.

## Pages - Complete Experiences

### Onboarding Page
```typescript
// src/pages/Onboarding.tsx
```
The Onboarding page orchestrates the complete first-time user experience from landing to first dream created. The page manages state across multiple steps, ensuring data persists even if users navigate backward. The flow emphasizes emotional engagement before requesting any sensitive information, building trust and excitement progressively.

### Dreams Page
```typescript
// src/pages/Dreams.tsx
```
The Dreams page combines the Timeline and DreamBuilder organisms to create the primary planning interface. Users can view their dream timeline, add new dreams, and adjust existing ones all from this central hub. The page maintains view state in the URL, allowing users to share specific timeline views or return to their preferred zoom level.

### Progress Page
```typescript
// src/pages/Progress.tsx
```
The Progress page provides detailed analytics and insights about the savings journey. Multiple view options let users see daily, weekly, monthly, or yearly progress with appropriate visualizations for each timescale. The page celebrates achievements prominently while treating setbacks as learning opportunities.

## State Management with Zustand

### User Store
```typescript
// src/stores/userStore.ts
interface UserStore {
  user: User | null;
  preferences: UserPreferences;
  setUser: (user: User) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
}
```
The User Store manages authentication state and user preferences, persisting important settings to localStorage for consistency across sessions. Preferences include notification settings, display options, and encouragement style, allowing the app to adapt to individual user needs.

### Dream Store
```typescript
// src/stores/dreamStore.ts
interface DreamStore {
  dreams: Dream[];
  selectedDream: Dream | null;
  isLoading: boolean;
  error: string | null;
  fetchDreams: () => Promise<void>;
  addDream: (dream: DreamInput) => Promise<void>;
  updateDream: (id: number, updates: Partial<Dream>) => Promise<void>;
  deleteDream: (id: number) => Promise<void>;
  selectDream: (id: number) => void;
}
```
The Dream Store serves as the central repository for all dream-related data, handling API communication and optimistic updates. When users create or modify dreams, the store immediately updates the UI while making background API calls, rolling back only if the server request fails. This approach makes the app feel instantly responsive even with network latency.

### Progress Store
```typescript
// src/stores/progressStore.ts
interface ProgressStore {
  weeklyProgress: WeeklyProgress;
  monthlyProgress: MonthlyProgress;
  streaks: StreakData;
  logProgress: (amount: number, note?: string) => Promise<void>;
  fetchProgressSummary: (period: Period) => Promise<void>;
  calculateProjections: (dreamId: number) => ProjectionData;
}
```
The Progress Store manages all progress tracking and analytics, caching calculated values to prevent redundant computation. The store automatically invalidates relevant caches when new progress is logged, ensuring displays always show current data without unnecessary API calls.

## Styling Strategy

The application uses Tailwind CSS with custom configuration for consistent design tokens. Rather than creating separate CSS files, components use Tailwind utility classes with semantic grouping through component variants. This approach maintains styling consistency while keeping all component logic in one file.

Custom Tailwind utilities extend the default palette with dream-specific colors and animations. The configuration includes custom spacing scales optimized for mobile-first design and animation presets that maintain consistent motion throughout the app.

## Component Development Guidelines

When building new components, start with the simplest possible implementation that solves the immediate need. Add features and flexibility only when required by actual use cases, avoiding premature abstraction. Every component should have a single, clear responsibility that's evident from its name and props interface.

Props should be minimal and intuitive, with sensible defaults that work for the most common use case. Optional props add flexibility without complicating basic usage. When in doubt, create two simple components rather than one complex component with many conditional branches.

Error boundaries wrap major component trees to prevent single component failures from crashing the entire application. Each boundary provides a user-friendly fallback UI that maintains the encouraging tone even when technical issues occur.

Testing focuses on user interactions rather than implementation details. Components should be tested based on what users see and do, not how the component achieves its functionality internally. This approach ensures tests remain valid even as implementation evolves.

This component architecture provides a solid foundation for building the Dream Planner MVP while maintaining flexibility for future enhancements. The atomic design approach ensures consistency and reusability, while clear separation of concerns makes the codebase maintainable and extensible.