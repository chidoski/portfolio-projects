# Demo Annotations System - Usage Guide

## Overview
The `DemoAnnotations` component provides contextual, guided tour-style callouts during CEO presentations. It intelligently adapts messaging based on the CEO's background and known interests.

## Features
✅ **Subtle animations** with auto-dismiss after being read  
✅ **CEO-specific contextual messages** based on known backgrounds  
✅ **Guided tour flow** with sequence management  
✅ **Non-intrusive but attention-grabbing** design  
✅ **Keyboard shortcuts** for quick control  
✅ **Multiple CEO personas** with tailored messaging  

## Quick Start

### 1. Import the Component
```jsx
import DemoAnnotations, { useAnnotationSequence } from '../components/DemoAnnotations';
```

### 2. Add to Your Demo Component
```jsx
const CEODemo = () => {
  const [ceoPersona, setCeoPersona] = useState('fintech');
  const [annotationsEnabled, setAnnotationsEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState('problem');
  
  const { activeAnnotations } = useAnnotationSequence(currentStep, ceoPersona);

  return (
    <div>
      {/* Your demo content */}
      
      <DemoAnnotations
        activeAnnotations={activeAnnotations}
        ceoPersona={ceoPersona}
        demoMode={annotationsEnabled}
        autoAdvance={true}
        onAnnotationDismiss={(id) => console.log('Dismissed:', id)}
      />
    </div>
  );
};
```

## CEO Personas

### Available Personas
- **`fintech`** - FinTech CEO focused on engagement & retention
- **`b2c`** - B2C Startup CEO focused on user experience & viral growth  
- **`enterprise`** - Enterprise CEO focused on market size & scalability
- **`generic`** - Generic CEO focused on innovation & market opportunity

### Example Contextual Messages

**Traditional Apps Problem:**
- **FinTech CEO**: "This solves the engagement problem you mentioned in your podcast"
- **B2C CEO**: "This is why we retain users 10x longer than traditional apps"
- **Enterprise CEO**: "This creates the sustainable moats you look for in investments"

## Annotation Types & Positioning

### Built-in Annotations

#### `traditional-apps-fail`
- **Type**: `insight`
- **Message**: "Traditional apps stop at expense tracking - we continue for 40 years"
- **Position**: Top-right (20%, 10%)
- **Timing**: 2s delay, 8s duration

#### `three-bucket-innovation`
- **Type**: `breakthrough` 
- **Message**: "Not retirement at 65, but dreams in 5-15 years"
- **Position**: Top-left (30%, 15%)
- **Timing**: 3s delay, 10s duration

#### `engagement-multiplier`
- **Type**: `metrics`
- **Message**: "12 minutes vs 2 minutes - users plan life, not just track expenses"
- **Position**: Top-left (15%, 25%)
- **Timing**: 1s delay, 7s duration

#### `ltv-dominance`
- **Type**: `economics`
- **Message**: "$4,800 vs $45 LTV - 40-year relationships vs 3-month churn"
- **Position**: Top-right (40%, 15%)
- **Timing**: 2.5s delay, 8s duration

## Keyboard Controls

| Key | Action |
|-----|--------|
| `A` | Toggle annotations on/off |
| `P` | Toggle presenter mode |
| `D` | Next demo step |
| `R` | Reset demo |
| `1-9` | Jump to specific steps |

## Animation Types

- **`insight`** - Subtle bounce with blue styling
- **`breakthrough`** - Pulsing glow with purple styling
- **`metrics`** - Scale-in with orange styling
- **`economics`** - Slide-in-left with pink styling
- **`opportunity`** - Float-up with indigo styling
- **`outcome`** - Celebration bounce with emerald styling

## Step-to-Annotation Mapping

```javascript
const STEP_ANNOTATIONS = {
  'problem': ['traditional-apps-fail'],
  'solution': ['three-bucket-innovation'], 
  'sarah_story': ['life-resilience'],
  'business_metrics': ['engagement-multiplier', 'ltv-dominance'],
  'market_opportunity': ['market-expansion'],
  'success_demo': ['emotional-payoff']
};
```

## Customization

### Adding New Annotations
```javascript
const NEW_ANNOTATION = {
  id: 'my-annotation',
  type: 'insight',
  title: 'Key Innovation',
  message: 'Your base message here',
  icon: <Lightbulb className="w-4 h-4" />,
  position: { top: '20%', right: '10%' },
  timing: { delay: 2000, duration: 8000 },
  ceoContext: {
    fintech: 'Message for FinTech CEOs',
    b2c: 'Message for B2C CEOs',
    enterprise: 'Message for Enterprise CEOs'
  }
};
```

### Custom Positioning
```javascript
position: { 
  top: '20%',    // Distance from top
  right: '10%',  // Distance from right
  // OR
  bottom: '25%', // Distance from bottom  
  left: '15%'    // Distance from left
}
```

## Integration with CEO Demo Controller

The `CEODemoController` already includes full integration:

1. **Persona Selector** - Dropdown to choose CEO type
2. **Annotation Toggle** - Button to enable/disable annotations
3. **Auto-sequencing** - Annotations appear based on demo step
4. **Keyboard Shortcuts** - All controls accessible via keyboard

## Best Practices

### Timing
- **Delay**: 1-3 seconds after content appears
- **Duration**: 6-10 seconds for reading
- **Auto-dismiss**: Enabled during live demos

### Messaging
- **Keep it concise** - Max 2 lines of text
- **Make it contextual** - Reference CEO's known interests
- **Focus on differentiation** - Highlight unique advantages

### Positioning
- **Avoid content overlap** - Place near relevant elements
- **Consider reading flow** - Top-to-bottom, left-to-right
- **Mobile responsiveness** - Test on different screen sizes

## Testing

Run the test component to verify annotations:
```jsx
import DemoAnnotationsTest from './DemoAnnotations.test';

// Simulates different demo steps and personas
// Auto-cycles through annotations every 8 seconds
```

## Troubleshooting

### Annotations Not Appearing
1. Check `demoMode={true}` is set
2. Verify `activeAnnotations` array has values
3. Ensure CSS animations are loading

### Wrong Context Messages
1. Verify `ceoPersona` prop matches available personas
2. Check annotation has `ceoContext` for that persona
3. Falls back to base message if no context found

### Timing Issues  
1. Adjust `delay` and `duration` in annotation config
2. Consider demo step transition timing
3. Test with `autoAdvance={false}` for manual control

---

**Perfect for CEO presentations where every detail matters! 🎯**
