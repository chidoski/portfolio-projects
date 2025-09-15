# ErrorBoundary Usage Guide

## Overview

The ErrorBoundary component provides a safety net for React component crashes, displaying a user-friendly recovery interface instead of a blank page.

## Features

- **Catches React Errors**: Intercepts component crashes and render errors
- **User-Friendly Recovery**: Shows helpful error message with clear action buttons
- **Data Management**: Option to clear localStorage and reset app state
- **Development Support**: Shows technical error details in development mode
- **Multiple Recovery Options**: Try again, go home, or reset completely

## Implementation

The ErrorBoundary is wrapped around the entire App component in `App.tsx`:

```tsx
<ErrorBoundary>
  <div className="min-h-screen mesh-gradient-subtle">
    {/* App content */}
  </div>
</ErrorBoundary>
```

## Recovery Options

### 1. Try Again
- Resets the ErrorBoundary state
- Attempts to re-render the failed component
- Best for temporary/intermittent errors

### 2. Go to Home
- Navigates to the home page
- Preserves user data
- Good for page-specific issues

### 3. Clear All Data & Reset App
- Removes all localStorage data including:
  - `financialProfile`
  - `dreamPlannerState`
  - `userPreferences`
  - `somedayLifeData`
- Clears sessionStorage
- Reloads the entire application
- Use as last resort for persistent issues

## Testing

### Development Testing
Visit `/error-test` in development mode to access the ErrorBoundaryTest component with buttons to trigger different error types:

- **Render Error**: Triggers a component crash during render
- **Async Error**: Simulates async operation failure (console only)
- **LocalStorage Error**: Attempts to exceed localStorage quota

### Error Types Caught
- Component render errors
- Constructor errors
- Lifecycle method errors
- Event handler errors (partially)

### Error Types NOT Caught
- Async errors (setTimeout, promises)
- Event handler errors (most cases)
- Server-side rendering errors
- Errors in the ErrorBoundary itself

## Development Mode Features

In development mode, the ErrorBoundary displays:
- Full error message
- Component stack trace
- Collapsible technical details

## Customization

### Styling
The ErrorBoundary uses Tailwind CSS classes and can be customized by modifying the component styles.

### Error Reporting
Add external error reporting by implementing a logging service in the `componentDidCatch` method:

```javascript
componentDidCatch(error, errorInfo) {
  // Log to external service
  logErrorToService(error, errorInfo);
}
```

### Recovery Actions
Additional recovery actions can be added by:
1. Adding new methods to the ErrorBoundary class
2. Adding corresponding buttons in the render method
3. Implementing custom recovery logic

## Best Practices

1. **Place High in Component Tree**: Wrap major sections of your app
2. **Provide Clear Recovery**: Give users obvious next steps
3. **Log Errors**: Capture errors for debugging and monitoring
4. **Test Regularly**: Use the test component to verify functionality
5. **Graceful Degradation**: Ensure core functionality remains accessible

## Integration with Other Components

The ErrorBoundary works seamlessly with:
- React Router (preserves navigation)
- State management (can reset or preserve state)
- LocalStorage operations (can clear problematic data)
- Development tools (shows debug information)

## Troubleshooting

### ErrorBoundary Not Catching Errors
- Ensure the error occurs during render, not in event handlers
- Check that the ErrorBoundary is properly wrapped around the failing component
- Verify the error is a JavaScript error, not a network or async error

### Recovery Not Working
- Check browser console for additional errors
- Verify localStorage permissions
- Ensure network connectivity for page reloads

### Data Loss Concerns
- The "Clear All Data" option is destructive by design
- Users are warned before data clearing
- Consider implementing data backup before clearing
