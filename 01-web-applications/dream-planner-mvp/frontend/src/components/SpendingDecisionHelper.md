# SpendingDecisionHelper Component

A React component that helps users make conscious spending decisions by framing purchases in terms of their dream impact rather than imposing budgeting restrictions.

## Philosophy

Instead of saying "You can't afford this," the component asks "Is this worth delaying your dream?" This empowering approach:
- ✅ Celebrates conscious choices (both spending and saving)
- ✅ Frames spending as dream timeline impact
- ✅ Provides positive reinforcement for any decision
- ✅ Encourages mindful spending without shame

## Features

### 🎯 Dream Impact Visualization
- Shows exactly how a purchase affects dream timeline
- Calculates impact in most meaningful time unit (hours, days, weeks, months)
- Displays percentage of total dream cost

### 🎉 Positive Decision Celebration
- **"Worth it!" choice**: Celebrates conscious spending decision
- **"Maybe not" choice**: Shows satisfying animation of money being added to dream fund
- No judgment - both choices are validated

### 🎨 Beautiful UI
- Smooth animations and transitions
- Contextual messaging based on purchase category
- Gradient backgrounds and modern design
- Mobile-responsive layout

### 🧠 Smart Messaging
- Category-specific contextual messages
- Personalized dream impact calculations
- Encouraging tone regardless of choice

## Usage

### Basic Implementation

```jsx
import SpendingDecisionHelper, { useSpendingDecisionHelper } from './components/SpendingDecisionHelper'

function MyExpenseTracker() {
  const { showHelper, SpendingDecisionHelper } = useSpendingDecisionHelper(100) // $100 threshold
  
  const handlePurchase = (purchase) => {
    const userDream = getCurrentUserDream() // Your dream data
    
    // Show helper if purchase is above threshold
    const wasShown = showHelper(purchase, userDream)
    
    if (!wasShown) {
      // Purchase was below threshold, log normally
      logPurchaseDirectly(purchase)
    }
  }
  
  const handleDecision = (decision) => {
    if (decision.decision === 'worth-it') {
      // User chose to keep the purchase
      logPurchase(decision.purchase)
      showSuccessMessage('Conscious choice celebrated! 🎉')
    } else if (decision.decision === 'dream-boost') {
      // User chose to skip purchase and boost dream
      addToDreamSavings(decision.amountAdded)
      showSuccessMessage(`$${decision.amountAdded} added to your dream! 🚀`)
    }
  }
  
  return (
    <div>
      {/* Your expense tracking UI */}
      <SpendingDecisionHelper onDecision={handleDecision} />
    </div>
  )
}
```

### Advanced Configuration

```jsx
const { showHelper, SpendingDecisionHelper } = useSpendingDecisionHelper(150) // Custom threshold

// Custom threshold per category
const shouldShowHelper = (purchase, dream) => {
  const thresholds = {
    dining: 75,
    shopping: 100,
    entertainment: 50,
    travel: 200
  }
  
  const threshold = thresholds[purchase.category] || 100
  return purchase.amount >= threshold
}
```

## Data Structures

### Purchase Object
```javascript
{
  id: 'unique-id',
  amount: 200,
  category: 'dining', // dining, shopping, entertainment, travel, etc.
  description: 'Fancy dinner at Le Bernardin',
  date: '2024-01-15' // optional
}
```

### Dream Object
```javascript
{
  id: 'dream-id',
  title: 'Maine Cottage',
  target_amount: 75000,
  current_amount: 15000,
  daily_amount: 68.49, // Required for impact calculation
  status: 'active'
}
```

### Decision Response
```javascript
{
  decision: 'worth-it' | 'dream-boost',
  purchase: { /* original purchase object */ },
  amountAdded: 200, // Only present for 'dream-boost'
  message: 'Conscious choice celebrated! 🎉'
}
```

## Component Props

### SpendingDecisionHelper
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `purchase` | Object | - | Purchase object to evaluate |
| `dream` | Object | - | User's active dream |
| `onDecision` | Function | - | Callback when user makes decision |
| `onClose` | Function | - | Callback when modal is closed |
| `isVisible` | Boolean | false | Controls modal visibility |
| `threshold` | Number | 100 | Minimum amount to trigger helper |

### useSpendingDecisionHelper Hook
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `threshold` | Number | 100 | Default threshold for showing helper |

Returns:
- `isVisible`: Boolean - Current visibility state
- `currentPurchase`: Object - Current purchase being evaluated
- `currentDream`: Object - Current dream being used
- `showHelper(purchase, dream)`: Function - Show helper for purchase
- `hideHelper()`: Function - Hide the helper
- `handleDecision(decision)`: Function - Handle user decision
- `SpendingDecisionHelper`: Component - Pre-configured component

## Contextual Messages

The component generates contextual messages based on purchase categories:

### Dining
- "This $200 dinner is 3 days of Maine cottage savings. Savor every bite?"
- "That $150 meal could delay Maine cottage by 2.2 days. Worth the experience?"

### Shopping
- "This $300 purchase pushes Maine cottage back by 4.4 days. Love what you're getting?"
- "$250 shopping spree = 3.6 days delay for Maine cottage. Totally worth it?"

### Entertainment
- "$100 for fun delays Maine cottage by 1.5 days. Making memories?"
- "This $75 entertainment choice costs 1.1 days of Maine cottage. Enjoying yourself?"

### Travel
- "$500 for travel delays Maine cottage by 7.3 days. Adventure calling?"
- "This $350 trip pushes Maine cottage back 5.1 days. Creating lasting memories?"

## Animations

### Worth It Celebration
- Confetti emoji animation
- Green success colors
- Positive reinforcement message
- 2-second duration

### Dream Boost Animation
- Rocket emoji with rotation
- Money transfer visualization
- Purple/pink gradient colors
- Progress indicator
- 2.5-second duration

## Integration Examples

### With Expense Tracking App
```jsx
const ExpenseForm = () => {
  const { showHelper, SpendingDecisionHelper } = useSpendingDecisionHelper()
  
  const submitExpense = (expenseData) => {
    const userDream = useUserDream()
    showHelper(expenseData, userDream)
  }
  
  return (
    <>
      <form onSubmit={submitExpense}>
        {/* expense form fields */}
      </form>
      <SpendingDecisionHelper onDecision={handleExpenseDecision} />
    </>
  )
}
```

### With Receipt Scanner
```jsx
const ReceiptScanner = () => {
  const { showHelper } = useSpendingDecisionHelper(50) // Lower threshold for scanned receipts
  
  const processScannedReceipt = (receiptData) => {
    const purchase = parseReceiptData(receiptData)
    const userDream = getCurrentDream()
    
    showHelper(purchase, userDream)
  }
  
  // ... rest of component
}
```

### With Banking Integration
```jsx
const TransactionMonitor = () => {
  const { showHelper } = useSpendingDecisionHelper()
  
  useEffect(() => {
    // Monitor bank transactions
    bankAPI.onTransaction((transaction) => {
      if (isDiscretionarySpending(transaction)) {
        const purchase = formatTransaction(transaction)
        const userDream = getUserPrimaryDream()
        
        showHelper(purchase, userDream)
      }
    })
  }, [])
  
  // ... rest of component
}
```

## Customization

### Custom Threshold Logic
```jsx
const customShowHelper = (purchase, dream) => {
  // Category-specific thresholds
  const categoryThresholds = {
    groceries: 150,    // Higher threshold for necessities
    dining: 50,        // Lower threshold for discretionary
    entertainment: 30,
    shopping: 75
  }
  
  const threshold = categoryThresholds[purchase.category] || 100
  return purchase.amount >= threshold
}
```

### Custom Messages
```jsx
const CustomSpendingHelper = ({ purchase, dream, ...props }) => {
  const customMessage = generateCustomMessage(purchase, dream)
  
  return (
    <SpendingDecisionHelper
      {...props}
      purchase={{ ...purchase, customMessage }}
      dream={dream}
    />
  )
}
```

## Best Practices

### 1. Set Appropriate Thresholds
- Consider user's income level
- Adjust by spending category
- Start conservative and adjust based on usage

### 2. Ensure Dream Data Quality
- Always have an active dream
- Keep `daily_amount` updated
- Provide meaningful dream titles

### 3. Handle Edge Cases
- No active dreams
- Very small/large purchases
- Missing purchase data

### 4. Provide Feedback
- Always acknowledge user decisions
- Show impact of dream boosts
- Celebrate conscious choices

### 5. Respect User Autonomy
- Never shame spending decisions
- Frame as choices, not restrictions
- Celebrate both "worth it" and "dream boost" choices

## Testing

The component includes a demo page at `/spending-demo` that shows:
- Sample purchases with different amounts and categories
- Interactive decision flow
- Animation demonstrations
- Integration examples

To test:
1. Navigate to `/spending-demo`
2. Click on sample purchases above the threshold
3. Try both "Worth it!" and "Maybe not" decisions
4. Observe the celebration animations

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Clear focus indicators
- Semantic HTML structure

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly interactions
- Smooth animations with fallbacks
