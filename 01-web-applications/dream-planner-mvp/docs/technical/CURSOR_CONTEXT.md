# Cursor Context Guide - Dream Planner MVP

## Project Context for AI Assistant

You are helping build Dream Planner, a revolutionary web application that transforms retirement planning into an engaging journey of achieving progressive life dreams. This document provides essential context to help you understand the project's vision, architecture, and implementation priorities.

The core insight driving this product is that traditional retirement planning fails younger generations because it focuses on a distant, abstract goal decades away. Dream Planner solves this by breaking down large financial goals into weekly habits and celebrating progress along the way, making saving feel achievable and rewarding rather than restrictive and punishing.

## The User Problem We're Solving

Our target users, aged 25-45, feel overwhelmed by traditional financial planning. They face unique pressures including student loans, housing costs, and career uncertainty that make conventional advice feel impossibly out of reach. They don't lack the desire to save; they lack a framework that makes saving feel achievable while living a fulfilling life today.

When these users see they need two million dollars for retirement, they experience paralysis rather than motivation. But when they see that their dream vacation requires just fifteen dollars per day, or that skipping three coffee purchases weekly could fund their sabbatical, suddenly the impossible becomes possible. This psychological shift from overwhelming to achievable is the core of our value proposition.

## Technical Implementation Philosophy

When implementing features, always prioritize user experience over technical perfection for this MVP. The goal is to demonstrate the vision and create an emotional connection with the product, not to build production-ready infrastructure. This means choosing simplicity over complexity, using mock data where appropriate, and focusing on the happy path user journey.

The frontend should feel delightful and engaging, with smooth animations and beautiful visualizations that make financial planning feel exciting rather than daunting. Every interaction should provide immediate feedback, and success moments should feel genuinely celebratory. The design aesthetic should evoke lifestyle and aspiration, not corporate finance.

The backend should be functional but not over-engineered. Use simple SQLite for data persistence, basic calculations for financial projections, and straightforward REST endpoints. Avoid complex authentication systems, elaborate caching strategies, or premature optimization. The focus is on demonstrating core functionality that can be enhanced later.

## Core Features to Implement

### 1. Onboarding Flow (Highest Priority)

The onboarding experience is crucial because it sets the emotional tone for the entire product. Users should go from skeptical to excited within five minutes. The flow should start with dream discovery, not financial interrogation. Ask users what they would do if money wasn't an obstacle, then show them how achievable their dreams actually are.

Implementation priorities for onboarding include a dream inspiration gallery with beautiful imagery that sparks imagination, a timeline visualizer that makes the future feel tangible and exciting, and a savings calculator that breaks intimidating numbers into daily coffee equivalents. The first achievement unlock should happen immediately to create positive reinforcement.

### 2. Dream Builder Interface

The dream builder is where users create emotional connections to their financial goals. Each dream needs to feel personal and inspiring, not like a sterile financial target. Users should be able to add photos, write descriptions, and see their dreams arranged on a beautiful timeline that scrolls smoothly from present to future.

The interface should support multiple dream categories including travel, home, education, family, and freedom, with distinct visual treatments for each. The timeline view should zoom between different time scales, from next year to next decade, maintaining context while focusing on specific periods. Progress indicators should be visually satisfying, using smooth animations and color gradients that make growth feel tangible.

### 3. Progress Tracking Dashboard

The dashboard is where users see their daily actions accumulating into meaningful progress. It should provide an at-a-glance view of overall wealth building while allowing drill-down into specific dreams. The design should celebrate being on track and gently encourage when behind, never shaming or creating anxiety.

Key dashboard elements include a hero metric showing total progress across all dreams, individual dream cards with progress rings or bars that fill satisfyingly, streak counters that gamify consistency without being punitive about breaks, and a "this week's focus" section that maintains momentum without overwhelming. The dashboard should adapt its messaging based on user performance, offering encouragement, celebration, or gentle course correction as appropriate.

### 4. Goal Decomposition Engine

The engine that breaks dreams into achievable chunks is the technical heart of the product. It should make large numbers feel small and impossible timelines feel achievable. The calculations should be transparent enough that users understand them but not so detailed that they become overwhelming.

The decomposition should show multiple perspectives on the same goal, such as daily, weekly, monthly, and yearly amounts. It should include creative comparisons like "one streaming subscription" or "two coffee purchases" to make amounts relatable. The engine should account for compound interest using conservative assumptions to avoid over-promising. Time flexibility options should show how adjusting the timeline affects required savings amounts.

### 5. Behavioral Nudge System

The nudge system maintains engagement without becoming annoying. It should feel like encouragement from a supportive friend, not nagging from a parent. Messages should vary to prevent staleness and adapt to user patterns and preferences.

Morning nudges should connect today's actions to dreams, such as "Today's $16 is one more day in Japan." Evening reflections should celebrate or reset without judgment. Weekly planning prompts should maintain momentum going into the new week. Achievement celebrations should feel genuinely exciting with appropriate visual and textual recognition.

## Design System and Component Architecture

The application uses a component-based architecture with Tailwind CSS for styling. Components should be built atomically, starting with basic building blocks and composing them into complex interfaces. This approach ensures consistency and reusability across the application.

The color palette should evoke warmth and possibility, using gradients and soft colors rather than stark corporate blues. Primary actions use warm coral tones, success states use vibrant greens, and dreams use a palette of purple, blue, and pink gradients. Typography should be modern and readable, with display fonts for headers and clean sans-serif for body text.

Animation and motion are crucial for making the application feel alive. Use subtle entrance animations for cards and content, smooth transitions between states, and celebratory animations for achievements. Micro-interactions should provide immediate feedback for all user actions. Loading states should be beautiful, not just functional, maintaining engagement even during waits.

## State Management Strategy

The application uses Zustand for state management, chosen for its simplicity and low boilerplate compared to Redux. State should be organized into logical stores that mirror the domain model, making it intuitive to find and update data.

The User Store manages authentication state, user preferences, and onboarding progress. The Dream Store contains all dreams, their associated goals, and calculation results. The Progress Store tracks savings activity, streaks, and achievement history. The UI Store manages modal states, loading indicators, and notification queues.

When implementing features, prefer optimistic updates that immediately reflect user actions, then reconcile with the backend. This makes the application feel responsive even with network latency. Error states should be handled gracefully, with clear messaging and recovery options rather than cryptic error codes.

## API Design Patterns

The backend API follows RESTful conventions with predictable URL patterns and appropriate HTTP methods. Endpoints should return consistent response formats with clear success and error states. All monetary values should be handled as strings to avoid floating-point precision issues.

When implementing endpoints, start with the happy path and add error handling incrementally. Use Pydantic models for request validation to catch issues early. Return helpful error messages that the frontend can display to users without translation. Include metadata in responses that might be useful for debugging or analytics.

For the MVP, avoid complex authentication flows. Use a simple user identifier header or create a default test user automatically. This lets you focus on core functionality rather than access control. Similarly, skip complex pagination for initial implementation, adding it only if lists become unwieldy.

## Data Model Considerations

The data model should be simple but extensible. Dreams are the core entity, containing goals, progress records, and calculations. Keep denormalization minimal for the MVP, preferring clarity over performance optimization.

When designing schemas, think about the user journey first and the database second. If a piece of data makes the user experience better, include it even if it creates some redundancy. For example, storing calculated values alongside inputs can improve response times and simplify frontend logic.

Use enums for status fields and categories to ensure consistency. Include created and updated timestamps on all entities for debugging and potential analytics. Make fields nullable when appropriate rather than requiring placeholder values that could confuse calculations.

## Testing and Quality Assurance

For the MVP demonstration, focus testing efforts on the critical user journey rather than comprehensive coverage. Ensure the onboarding flow works flawlessly since it's the first impression. Test the dream creation and progress tracking flows thoroughly as they demonstrate core value.

Manual testing is acceptable for the MVP, but document the test scenarios for future automation. Focus on user experience testing rather than unit tests, ensuring animations feel smooth, calculations appear correct, and the emotional journey feels right.

When you encounter bugs, prioritize fixing those that break the demo flow or create negative emotional experiences. Minor visual glitches or edge cases can be addressed post-demo if they don't impact the core narrative.

## Performance Optimization Guidelines

For the MVP, perceived performance matters more than actual performance. Use loading skeletons and smooth transitions to make waits feel shorter. Implement optimistic updates so user actions feel instant. Preload images for the dream gallery to prevent layout shifts.

Avoid premature optimization in calculations or database queries. Simple, readable code that works is better than complex optimizations for an MVP. If something feels slow, first check if it's a perception issue that can be solved with better loading states before optimizing the actual operation.

Frontend bundle size isn't critical for a local demo, but be mindful of adding large dependencies. Prefer lightweight libraries where possible, and use dynamic imports for features not needed immediately on page load.

## Error Handling Philosophy

Errors should be handled gracefully without breaking the user's emotional journey. When something goes wrong, maintain the aspirational tone of the product. Instead of "Error: Failed to save dream," use "We couldn't save your dream right now. Don't worry, your vision is safe - try again in a moment."

Implement fallbacks for critical features so the demo can continue even if something fails. For example, if the backend is unavailable, use local storage temporarily. If an API call fails, show cached or default data rather than error states.

Log errors comprehensively for debugging but don't expose technical details to users. The frontend should translate technical errors into user-friendly messages that maintain trust and encourage retry rather than abandonment.

## Implementation Priorities for Monday Demo

Given the Monday deadline, prioritize implementation in this order to ensure a compelling demonstration even if not everything is complete.

First, implement the complete onboarding flow from landing to first dream created. This establishes the emotional hook and value proposition immediately. The flow should work end-to-end even if using mock data for calculations.

Second, build the dream timeline visualization with at least three example dreams. The timeline should be beautiful and interactive, demonstrating the core concept of progressive goal achievement. Include smooth scrolling and zoom transitions that make exploring the future feel exciting.

Third, create the progress dashboard showing weekly and monthly views. Include mock progress data that shows a realistic journey with some weeks successful and others not, demonstrating how the product handles real-life variability. The dashboard should celebrate current streaks and overall progress.

Fourth, implement the goal breakdown calculator that shows daily, weekly, and monthly amounts. Include creative comparisons that make numbers relatable. This demonstrates the core insight of making large goals feel achievable through decomposition.

Fifth, if time permits, add the behavioral nudge system with at least mock notifications. Show how the product maintains engagement through encouragement rather than nagging. Include examples of morning motivation and evening reflection messages.

## Demo Narrative and Talking Points

During the demo, focus on the emotional journey rather than technical implementation. Start by establishing the problem that traditional retirement planning feels impossible for younger generations. Show how Dream Planner reframes the conversation from retirement to dreams, making the future feel exciting rather than daunting.

Walk through the onboarding experience as a new user would see it. Emphasize how quickly someone goes from skeptical to engaged. Show the dream timeline and explain how it makes abstract financial goals tangible and personal. Demonstrate the progress tracking and how it celebrates small wins while building toward large goals.

Key talking points include behavioral psychology principles that drive engagement, the massive addressable market of millennials entering peak earning years, natural viral loops through dream sharing and achievement celebration, clear monetization path through premium features and financial product partnerships, and the expansion opportunity from planning into investing and wealth management.

## Common Implementation Patterns

When implementing features, follow these patterns for consistency and efficiency. For form inputs, always provide immediate validation feedback without being punitive. Use debouncing for API calls triggered by user input. Show loading states for any operation taking longer than 200ms.

For data fetching, implement optimistic updates for user actions, use stale-while-revalidate patterns for background refreshes, and cache responses appropriately to reduce API calls. Handle offline scenarios gracefully with appropriate messaging.

For components, keep them focused on a single responsibility, use composition over complex props configurations, and implement proper loading and error states. Make components responsive by default rather than adding media queries later.

## Final Guidance for Cursor

Remember that this is an MVP for a demo, not a production application. When faced with implementation decisions, choose the option that best demonstrates the product vision, even if it's not the most technically elegant solution. The goal is to create an emotional connection with the product that makes the CEO envision its potential.

Focus on making the happy path perfect rather than handling every edge case. Use mock data strategically to show the full user journey even if backend functionality isn't complete. Prioritize visual polish and smooth interactions over backend complexity.

Most importantly, maintain the optimistic, achievable tone throughout the implementation. Every piece of copy, every animation, and every interaction should reinforce that dreams are achievable through small, consistent actions. The product should leave users feeling empowered and excited about their financial future, not overwhelmed or ashamed about their current situation.

This is your chance to demonstrate not just technical capability but product thinking and user empathy. Build something that would genuinely help millions of people achieve their dreams, starting with just $15 a day.