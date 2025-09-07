# Branch Selection System

This system provides a global branch selection feature that persists across the application.

## Features

- **Global State Management**: Selected branch is stored in a React Context and persists in localStorage
- **Database Integration**: Fetches branches from the Supabase `branches` table
- **Reusable Components**: Uses existing `SearchableDropdown` component for consistency
- **Type Safety**: Full TypeScript support with proper interfaces

## Components

### BranchSelector
A dropdown component that displays available branches and allows selection.

```tsx
import { BranchSelector } from '~/components/branch-selector';

// Use in your component
<BranchSelector />
```

### BranchDisplay
An example component showing how to display the selected branch information.

```tsx
import { BranchDisplay } from '~/components/branch-display';

// Use in your component
<BranchDisplay />
```

## Hooks

### useBranch
Access the globally selected branch and its setter function.

```tsx
import { useBranch } from '~/hooks';

function MyComponent() {
  const { selectedBranch, setSelectedBranch, isLoading } = useBranch();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!selectedBranch) {
    return <div>Please select a branch</div>;
  }
  
  return (
    <div>
      <h2>Current Branch: {selectedBranch.name}</h2>
      <p>Code: {selectedBranch.code}</p>
    </div>
  );
}
```

### useBranches
Fetch all available branches from the database.

```tsx
import { useBranches } from '~/hooks';

function MyComponent() {
  const { data: branches, isLoading, error } = useBranches();
  
  if (isLoading) return <div>Loading branches...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {branches?.map(branch => (
        <li key={branch.id}>{branch.name}</li>
      ))}
    </ul>
  );
}
```

## Types

```tsx
interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  is_active: boolean;
  city_region: string | null;
  commercial_registration_number: string | null;
  website: string | null;
  branch_license_number: string | null;
  created_at: string;
  updated_at: string;
}
```

## Setup

The system is already integrated into the application through the `BranchProvider` in `root-providers.tsx`. No additional setup is required.

## Usage Examples

### In API Routes
```tsx
// In an API route, you can access the selected branch from the request
export async function GET(request: NextRequest) {
  const { selectedBranch } = await getSelectedBranchFromRequest(request);
  
  if (!selectedBranch) {
    return NextResponse.json({ error: 'No branch selected' }, { status: 400 });
  }
  
  // Use selectedBranch.id in your database queries
  const data = await supabase
    .from('vehicles')
    .select('*')
    .eq('branch_id', selectedBranch.id);
}
```

### In Components
```tsx
function VehicleList() {
  const { selectedBranch } = useBranch();
  
  useEffect(() => {
    if (selectedBranch) {
      // Fetch vehicles for the selected branch
      fetchVehicles(selectedBranch.id);
    }
  }, [selectedBranch]);
  
  if (!selectedBranch) {
    return <div>Please select a branch to view vehicles</div>;
  }
  
  return <div>Vehicles for {selectedBranch.name}</div>;
}
```

## Database Schema

The system expects a `branches` table with the following structure:

```sql
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_name VARCHAR(255),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```
