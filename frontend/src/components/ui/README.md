# RAPEX UI Component Library

> Modern, minimalist UI components with purple-orange gradient theme

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Orange (#f97316) → Purple (#9333ea)
- **Background**: White (#ffffff)
- **Text**: Gray-800 (#1f2937)
- **Success**: Green-500 (#22c55e)
- **Error**: Red-500 (#ef4444)
- **Warning**: Orange-500 (#f97316)

### Design Principles
- **Modular**: Each component is self-contained and reusable
- **Consistent**: Same styling and behavior across the system
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Keyboard navigation and screen reader support
- **Performance**: Lightweight and optimized

---

## 📦 Components

### 1. Button
Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `icon`: ReactNode
- `disabled`: boolean

**Example:**
```tsx
import { Button } from '@/components/ui'

<Button variant="primary" size="lg">
  Click Me
</Button>
```

---

### 2. Input
Text input with label, icon, and error support.

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `label`: string
- `icon`: ReactNode (left icon)
- `rightIcon`: ReactNode
- `error`: string
- `required`: boolean

**Example:**
```tsx
import { Input } from '@/components/ui'

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  icon={<MailIcon />}
  required
/>
```

---

### 3. Card
Container component for content grouping.

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean (adds hover effect)
- `onClick`: function

**Example:**
```tsx
import { Card } from '@/components/ui'

<Card padding="lg" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

---

### 4. DashboardCard
Statistics card for dashboards with icon and trend.

**Props:**
- `title`: string
- `value`: string | number
- `icon`: ReactNode
- `trend`: { value: number, isPositive: boolean }
- `subtitle`: string

**Example:**
```tsx
import { DashboardCard } from '@/components/ui'

<DashboardCard
  title="Total Sales"
  value="$45,231"
  icon={<DollarIcon />}
  trend={{ value: 12, isPositive: true }}
  subtitle="vs last month"
/>
```

---

### 5. ProductCard
E-commerce product display card.

**Props:**
- `id`: string | number
- `name`: string
- `price`: number
- `image`: string
- `description`: string
- `rating`: number (1-5)
- `inStock`: boolean
- `discount`: number (percentage)
- `onAddToCart`: function
- `onClick`: function

**Example:**
```tsx
import { ProductCard } from '@/components/ui'

<ProductCard
  id={1}
  name="Product Name"
  price={99.99}
  image="/product.jpg"
  rating={4.5}
  discount={20}
  onAddToCart={(id) => console.log('Added:', id)}
/>
```

---

### 6. Modal
Overlay modal with header and footer.

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `footer`: ReactNode

**Example:**
```tsx
import { Modal, Button } from '@/components/ui'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>
```

---

### 7. Sidebar
Navigation sidebar with gradient background.

**Props:**
- `items`: Array<{ label, href, icon, badge }>
- `logo`: ReactNode
- `footer`: ReactNode

**Example:**
```tsx
import { Sidebar } from '@/components/ui'

<Sidebar
  items={[
    { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
    { label: 'Orders', href: '/orders', icon: <OrderIcon />, badge: 5 },
  ]}
  logo={<img src="/logo.png" />}
/>
```

---

### 8. Table
Data table with sorting and row click.

**Props:**
- `columns`: Array<{ key, label, sortable, render }>
- `data`: Array<any>
- `onRowClick`: function
- `loading`: boolean
- `emptyMessage`: string

**Example:**
```tsx
import { Table } from '@/components/ui'

<Table
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
  ]}
  data={users}
  onRowClick={(row) => console.log(row)}
/>
```

---

### 9. Toast
White notification toast with colored left border indicator and 3-second auto-dismiss.

**Design:**
- White background with colored left border (4px)
- Colored icon matching the type
- No progress timer
- Auto-dismisses after 3 seconds (default)
- Close button on the right

**Props:**
- `message`: string (required)
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `duration`: number in milliseconds (default: 3000)
- `onClose`: function (required)

**Usage for all notifications:**
```tsx
import { Toast } from '@/components/ui'
import { useState } from 'react'

// Success notification
<Toast
  message="Order created successfully!"
  type="success"
  onClose={() => setShowToast(false)}
/>

// Error notification
<Toast
  message="Failed to process payment"
  type="error"
  onClose={() => setShowToast(false)}
/>

// Warning notification
<Toast
  message="Your session will expire soon"
  type="warning"
  onClose={() => setShowToast(false)}
/>

// Info notification
<Toast
  message="New update available"
  type="info"
  onClose={() => setShowToast(false)}
/>

// Custom duration (5 seconds)
<Toast
  message="Custom timeout message"
  type="success"
  duration={5000}
  onClose={() => setShowToast(false)}
/>
```

**Toast Manager Example:**
```tsx
import { Toast } from '@/components/ui'
import { useState } from 'react'

export default function MyComponent() {
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    show: false,
    message: '',
    type: 'info'
  })

  const showToast = (message: string, type: typeof toast.type) => {
    setToast({ show: true, message, type })
  }

  const handleSubmit = async () => {
    try {
      await submitData()
      showToast('Data saved successfully!', 'success')
    } catch (error) {
      showToast('Failed to save data', 'error')
    }
  }

  return (
    <>
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        </div>
      )}
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}
```

**IMPORTANT:** 
- Always use this Toast component for ALL notifications (success, error, warning, info)
- Never create custom notification components
- Toast automatically times out after 3 seconds
- No progress bar or timer indicator is shown

---

### 10. Dropdown
Select dropdown with icons.

**Props:**
- `options`: Array<{ label, value, icon }>
- `value`: string | number
- `onChange`: function
- `label`: string
- `placeholder`: string
- `error`: string

**Example:**
```tsx
import { Dropdown } from '@/components/ui'

<Dropdown
  label="Select Role"
  options={[
    { label: 'Admin', value: 'admin', icon: <AdminIcon /> },
    { label: 'User', value: 'user', icon: <UserIcon /> },
  ]}
  value={role}
  onChange={(val) => setRole(val)}
/>
```

---

### 11. Pagination
Page navigation component.

**Props:**
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: function
- `maxVisible`: number (default: 5)

**Example:**
```tsx
import { Pagination } from '@/components/ui'

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={(p) => setPage(p)}
/>
```

---

### 12. ProgressBar
Progress indicator with percentage.

**Props:**
- `value`: number
- `max`: number (default: 100)
- `label`: string
- `showPercentage`: boolean
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'gradient' | 'green' | 'blue' | 'red' | 'yellow'

**Example:**
```tsx
import { ProgressBar } from '@/components/ui'

<ProgressBar
  value={75}
  label="Upload Progress"
  color="gradient"
/>
```

---

### 13. SearchField
Search input with clear button.

**Props:**
- `value`: string
- `onChange`: function
- `placeholder`: string
- `onSearch`: function (on Enter key)

**Example:**
```tsx
import { SearchField } from '@/components/ui'

<SearchField
  value={search}
  onChange={(val) => setSearch(val)}
  placeholder="Search products..."
  onSearch={() => handleSearch()}
/>
```

---

### 14. Tooltip
Hover tooltip component.

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right'

**Example:**
```tsx
import { Tooltip } from '@/components/ui'

<Tooltip content="Click to edit" position="top">
  <button>Edit</button>
</Tooltip>
```

---

### 15. Upload
Drag-and-drop file upload.

**Props:**
- `onFileSelect`: function
- `accept`: string (file types)
- `multiple`: boolean
- `maxSize`: number (bytes)

**Example:**
```tsx
import { Upload } from '@/components/ui'

<Upload
  onFileSelect={(files) => console.log(files)}
  accept="image/*"
  multiple
  maxSize={5 * 1024 * 1024}
/>
```

---

### 16. Form
Form wrapper with validation.

**Props:**
- `onSubmit`: function

**Example:**
```tsx
import { Form, Input, Button } from '@/components/ui'

<Form onSubmit={handleSubmit}>
  <Input label="Name" name="name" required />
  <Input label="Email" type="email" name="email" required />
  <Button type="submit">Submit</Button>
</Form>
```

---

## 🚀 Usage

### Import Components
```tsx
// Single import
import { Button } from '@/components/ui'

// Multiple imports
import { Button, Input, Card } from '@/components/ui'
```

### Theme Colors
Use Tailwind classes with our gradient:
```tsx
// Gradient background
className="bg-gradient-to-r from-orange-500 to-purple-600"

// Gradient text
className="gradient-text"

// Gradient border
className="gradient-border"
```

---

## 📱 Mobile Responsive

All components are **fully responsive** and work on:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

Touch-friendly interactions and optimized layouts for all screen sizes.

---

## ♿ Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader compatible
- Color contrast compliance

---

## 🎯 Best Practices

1. **Reuse Components**: Never duplicate UI code
2. **Props Over Customization**: Use provided props instead of custom CSS
3. **Consistent Spacing**: Use Tailwind spacing utilities
4. **Mobile First**: Design for mobile, then scale up
5. **Performance**: Lazy load when needed

---

## 📝 Notes

- All components follow the **RAPEX design system**
- Purple-orange gradient is the **primary theme**
- White backgrounds for **dashboards**
- Gradient backgrounds for **sidebars and actions**
- Components are **stateless** and **presentational**
- Business logic belongs in **parent components or hooks**

---

Built with ❤️ for RAPEX Platform
