# Animated Tajeer Logo Usage Guide

This guide explains how to use the animated Tajeer logo components for loading states in your application.

## Components

### 1. TajeerLogoAnimated

The base animated logo component with a progressive drawing animation effect.

**Features:**
- Uses the primary brand color (#005F8E)
- Smooth drawing animation that loops infinitely
- Each path element animates sequentially for a flowing effect
- 3-second animation cycle

**Usage:**
```tsx
import { TajeerLogoAnimated } from '@/app/reusableComponents/TajeerLogoAnimated';

function MyComponent() {
  return (
    <div>
      <TajeerLogoAnimated className="w-32 h-auto" />
    </div>
  );
}
```

### 2. LoadingScreen

A full-screen or inline loading overlay with the animated logo.

**Props:**
- `fullScreen` (boolean, default: `true`) - Display as full screen overlay
- `message` (string, optional) - Loading message to show below the logo

**Usage:**

**Full Screen Loading:**
```tsx
import { LoadingScreen } from '@/app/reusableComponents/LoadingScreen';

function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen message="Loading your data..." />;
  }

  return <div>Your content</div>;
}
```

**Inline Loading:**
```tsx
<LoadingScreen
  fullScreen={false}
  message="Processing..."
/>
```

### 3. InlineLoader

A smaller loader for inline loading states.

**Props:**
- `size` ('sm' | 'md' | 'lg', default: `'md'`) - Size of the loader
- `message` (string, optional) - Loading message

**Usage:**
```tsx
import { InlineLoader } from '@/app/reusableComponents/LoadingScreen';

function DataTable() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {isLoading ? (
        <InlineLoader size="md" message="Loading data..." />
      ) : (
        <table>{/* Your table content */}</table>
      )}
    </div>
  );
}
```

## Common Use Cases

### 1. Page Loading
```tsx
'use client';

import { LoadingScreen } from '@/app/reusableComponents/LoadingScreen';
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Loading page..." />;
  }

  return <div>Page Content</div>;
}
```

### 2. Data Fetching in Components
```tsx
import { InlineLoader } from '@/app/reusableComponents/LoadingScreen';
import { useQuery } from '@tanstack/react-query';

function VehiclesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  if (isLoading) {
    return <InlineLoader size="lg" message="Loading vehicles..." />;
  }

  return <div>{/* Render vehicles */}</div>;
}
```

### 3. Button Loading State
```tsx
import { TajeerLogoAnimated } from '@/app/reusableComponents/TajeerLogoAnimated';

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button disabled={isSubmitting} className="flex items-center gap-2">
      {isSubmitting ? (
        <>
          <TajeerLogoAnimated className="w-5 h-auto" />
          <span>Submitting...</span>
        </>
      ) : (
        <span>Submit</span>
      )}
    </button>
  );
}
```

### 4. Suspense Fallback
```tsx
import { Suspense } from 'react';
import { LoadingScreen } from '@/app/reusableComponents/LoadingScreen';

function App() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <YourAsyncComponent />
    </Suspense>
  );
}
```

## Animation Details

The animation consists of two phases:
1. **Drawing Phase (0-50%)**: Each path is drawn progressively using stroke-dashoffset
2. **Fill Phase (50-100%)**: The paths transition from stroke to filled state

The animation:
- Duration: 3 seconds per cycle
- Loops: Infinite
- Stagger: 0.1s delay between each path element
- Easing: ease-in-out for smooth motion

## Customization

### Adjust Animation Speed
To change the animation duration, modify the `animation` property in `TajeerLogoAnimated.tsx`:

```css
animation: drawPath 3s ease-in-out infinite;
/* Change 3s to your desired duration */
```

### Change Stagger Delay
To adjust the delay between path animations, modify the animation-delay values:

```css
.tajeer-logo-animated path:nth-child(2) { animation-delay: 0.1s; }
/* Change 0.1s increments to your desired delay */
```

### Customize Colors
The primary color is set to `#005F8E`. To change it, update:
- `fill: #005F8E;`
- `stroke: #005F8E;`

in the component's style tag.

## Static Logo

For non-animated instances, use the static SVG:
```tsx
import Image from 'next/image';

<Image
  src="/images/Icons/Tajeer-logo.svg"
  alt="Tajeer Logo"
  width={103}
  height={50}
/>
```

The static logo also uses the primary color (#005F8E).

