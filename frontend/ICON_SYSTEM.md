# Icon System Documentation

## Overview
RAPEX uses a centralized icon system following the blueprint requirements:
- ✅ Uses React icon libraries (Lucide React + React Icons)
- ✅ NO manual SVG icons
- ✅ Consistent sizing and styling
- ✅ Easy to maintain and swap

## Usage

### Basic Icon Usage
```tsx
import { Icon } from '@/components/ui'

// Simple icon
<Icon name="User" size={24} />

// With styling
<Icon name="ShoppingCart" size={20} className="text-blue-500" />

// With click handler
<Icon name="Settings" size={24} onClick={handleClick} />
```

### Using Predefined Sizes
```tsx
import { Icon, IconSizes } from '@/components/ui'

<Icon name="Home" size={IconSizes.sm} />  // 20px
<Icon name="Mail" size={IconSizes.md} />  // 24px (default)
<Icon name="User" size={IconSizes.lg} />  // 32px
```

### Available Icon Sizes
- `xs`: 16px
- `sm`: 20px
- `md`: 24px (default)
- `lg`: 32px
- `xl`: 40px
- `xxl`: 48px

### Importing Icons Directly
```tsx
// From centralized exports
import { Home, ShoppingCart, User } from '@/components/ui'

// Use as components
<Home size={24} />
<ShoppingCart size={20} className="text-gray-500" />
```

## Available Icons
All Lucide React icons are available. Commonly used icons are also exported from `@/components/ui/icons.ts`:

### Navigation
- Home, Menu, ChevronDown, ChevronUp, ChevronLeft, ChevronRight

### Actions
- Plus, Minus, Edit, Trash2, Save, Check, X, Search, Filter

### E-commerce
- ShoppingCart, ShoppingBag, Package, Heart, Star, TrendingUp

### User & Auth
- User, UserPlus, Lock, Unlock, Eye, EyeOff

### Communication
- Bell, MessageSquare, Mail, Phone

### And many more...

## Rules (Following Blueprint)
1. **NEVER create manual SVG icons**
2. **ALWAYS use the Icon component or import from libraries**
3. **Use consistent sizing via IconSizes**
4. **Keep icons in the centralized icon system**

## Adding New Icons
If you need an icon not currently exported:
1. Check if it exists in Lucide React: https://lucide.dev/icons
2. Add it to `src/components/ui/icons.ts` exports
3. Use it via the Icon component: `<Icon name="NewIconName" />`

## Favicon & App Icons
The app uses Next.js App Router icon convention:
- `/src/app/icon.tsx` - Generates the favicon dynamically
- `/src/app/apple-icon.tsx` - Generates the Apple touch icon

No need for manual favicon.ico files in the public folder.
