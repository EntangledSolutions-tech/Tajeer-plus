# Reusable Components

This directory contains reusable UI components that provide consistent styling and behavior across the application.

## CustomCard

The `CustomCard` component is a flexible, customizable card wrapper that provides consistent elevation and shadow styling while allowing extensive customization through props.

### Features

- **Consistent Styling**: Provides uniform elevation and shadow across all cards
- **Highly Customizable**: Multiple props for shadow, elevation, border, background, and more
- **Responsive Design**: Built with Tailwind CSS for responsive layouts
- **TypeScript Support**: Full TypeScript support with comprehensive prop interfaces
- **Accessibility**: Proper semantic HTML and ARIA support

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render inside the card |
| `shadow` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'sm'` | Shadow level for the card |
| `elevation` | `'none' \| 'low' \| 'default' \| 'high' \| 'max'` | `'default'` | Elevation level affecting border and background |
| `hover` | `boolean` | `true` | Whether to show hover effects |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'xl'` | Border radius |
| `border` | `'none' \| 'default' \| 'subtle' \| 'accent'` | `'default'` | Border style |
| `background` | `'default' \| 'muted' \| 'transparent'` | `'default'` | Background style |
| `padding` | `'none' \| 'sm' \| 'default' \| 'lg' \| 'xl'` | `'default'` | Padding size |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `HTMLDivElement` | - | All standard HTML div attributes |

### Basic Usage

```tsx
import CustomCard from '@/app/reusableComponents/CustomCard';

// Default card
<CustomCard>
  <h3>Simple Card</h3>
  <p>This card uses all default styling.</p>
</CustomCard>

// Customized card
<CustomCard
  shadow="lg"
  elevation="high"
  radius="2xl"
  border="accent"
  background="muted"
  padding="lg"
  hover={true}
>
  <h3>Premium Card</h3>
  <p>This card has custom styling applied.</p>
</CustomCard>
```

### Shadow Levels

- `none`: No shadow
- `xs`: Extra small shadow
- `sm`: Small shadow (default)
- `md`: Medium shadow
- `lg`: Large shadow
- `xl`: Extra large shadow
- `2xl`: 2XL shadow

### Elevation Levels

- `none`: No border, transparent background
- `low`: Thin border with white background
- `default`: Standard border with white background (default)
- `high`: Thick border with white background
- `max`: Maximum border thickness with white background

### Border Radius Options

- `none`: No border radius
- `sm`: Small radius
- `md`: Medium radius
- `lg`: Large radius
- `xl`: Extra large radius (default)
- `2xl`: 2XL radius
- `3xl`: 3XL radius

### Border Styles

- `none`: No border
- `default`: Standard border
- `subtle`: Light gray border
- `accent`: Blue accent border

### Background Options

- `default`: White background
- `muted`: Light gray background
- `transparent`: Transparent background

### Padding Sizes

- `none`: No padding
- `sm`: Small padding (12px)
- `default`: Default padding (24px)
- `lg`: Large padding (32px)
- `xl`: Extra large padding (40px)

### Common Use Cases

#### Dashboard Cards
```tsx
<CustomCard shadow="md" elevation="default" padding="lg">
  <div className="flex items-center space-x-3 mb-4">
    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold">📊</span>
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">Total Revenue</h4>
      <p className="text-sm text-gray-500">Last 30 days</p>
    </div>
  </div>
  <div className="text-3xl font-bold text-gray-900 mb-2">$24,780</div>
  <div className="text-sm text-green-600">+12% from last month</div>
</CustomCard>
```

#### Form Cards
```tsx
<CustomCard shadow="sm" elevation="low" padding="xl">
  <h4 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h4>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your name"
      />
    </div>
  </div>
</CustomCard>
```

#### Content Cards
```tsx
<CustomCard shadow="lg" elevation="high" radius="xl">
  <div className="flex items-center space-x-3 mb-4">
    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-lg">🎯</span>
    </div>
    <div>
      <h4 className="text-xl font-bold text-gray-900">Project Overview</h4>
      <p className="text-gray-600">Updated 2 hours ago</p>
    </div>
  </div>
  <p className="text-gray-700 leading-relaxed mb-4">
    Project description and details...
  </p>
</CustomCard>
```

### Best Practices

1. **Consistency**: Use the same shadow and elevation levels for similar content types
2. **Hierarchy**: Use higher elevation and shadow for more important content
3. **Accessibility**: Ensure sufficient contrast between card background and content
4. **Responsiveness**: Cards automatically adapt to different screen sizes
5. **Performance**: The component is lightweight and doesn't add unnecessary re-renders

### Examples

See `CustomCardExample.tsx` for comprehensive examples of all prop combinations and real-world usage patterns.

### Migration from Existing Cards

If you're migrating from existing card implementations:

1. Replace `<div className="bg-white rounded-xl border shadow-sm p-6">` with `<CustomCard>`
2. Add specific props for customization: `<CustomCard shadow="sm" elevation="default" radius="xl" padding="default">`
3. Remove hardcoded classes that are now handled by props
4. Test hover effects and ensure they match your design requirements

### Contributing

When adding new features to CustomCard:

1. Maintain backward compatibility
2. Add comprehensive TypeScript types
3. Include examples in the CustomCardExample component
4. Update this documentation
5. Follow the existing code style and patterns
