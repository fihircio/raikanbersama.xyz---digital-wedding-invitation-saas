# Catalog and Pricing Pages Implementation Plan

## Overview
This document outlines the implementation plan for adding two new pages to the RaikanBersama.xyz wedding invitation SaaS platform:
1. **Catalog/Templates Page** - A gallery of background images for invitations
2. **Pricing Page** - Subscription plans comparison and purchase

## Component Architecture

### 1. Catalog Page (`/catalog`)

#### File Structure
```
components/
├── Catalog/
│   ├── CatalogPage.tsx          # Main catalog page component
│   ├── BackgroundGrid.tsx       # 5x3 grid of background images
│   ├── BackgroundCard.tsx       # Individual background card
│   ├── Pagination.tsx           # Pagination controls
│   └── BackgroundPreview.tsx     # Modal for previewing selected background
```

#### Component Details

**CatalogPage.tsx**
- Manages overall catalog state
- Handles pagination (3 pages, 15 backgrounds each)
- Implements authentication check for applying backgrounds
- Integrates with editor studio for background selection

**BackgroundGrid.tsx**
- Displays 5x3 grid of background images
- Responsive design (adjusts columns on mobile)
- Loading skeleton states

**BackgroundCard.tsx**
- Individual background image card
- Hover effects and selection states
- Preview button
- "Apply" button (requires authentication)

**Pagination.tsx**
- Page navigation controls
- Shows current page and total pages
- Smooth transitions between pages

#### State Management
```typescript
interface CatalogState {
  currentPage: number;
  backgrounds: BackgroundImage[];
  selectedBackground: BackgroundImage | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface BackgroundImage {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
  category: string;
  isPremium?: boolean;
}
```

#### Integration with Editor Studio
- When user selects a background, store it in localStorage/sessionStorage
- Editor Studio checks for selected background on load
- Updates `invitation.settings.background_image` field

### 2. Pricing Page (`/pricing`)

#### File Structure
```
components/
├── Pricing/
│   ├── PricingPage.tsx          # Main pricing page component
│   ├── PricingCard.tsx          # Individual pricing plan card
│   ├── FeatureComparison.tsx     # Feature comparison table
│   └── PaymentModal.tsx         # Payment flow modal
```

#### Component Details

**PricingPage.tsx**
- Main pricing page with hero section
- 2x1 grid for Basic and Premium plans
- FAQ section
- Testimonials section

**PricingCard.tsx**
- Individual plan card with:
  - Plan name and price
  - Feature list
  - "Purchase" button
  - Popular badge for recommended plan

**FeatureComparison.tsx**
- Detailed comparison table
- Checkmarks for included features
- Responsive design

**PaymentModal.tsx**
- Payment flow integration
- Form validation
- Loading states during payment processing

#### Subscription Plans

**Basic Plan - RM27.90**
- 5 invitations per year
- Basic templates (10 options)
- Standard customization options
- 50 RSVPs per invitation
- Basic analytics
- Email support

**Premium Plan - RM57.90**
- Unlimited invitations
- Premium templates (30+ options)
- Advanced customization (custom colors, fonts)
- 500 RSVPs per invitation
- Advanced analytics dashboard
- Priority support
- Custom domain option
- AI Assistant access (Magic Pantun, Magic Story)
- Gallery with up to 10 images

## Implementation Steps

### Phase 1: Basic Structure
1. Create component files for Catalog and Pricing pages
2. Add routing in App.tsx
3. Update Navbar links
4. Implement basic page layouts with placeholder content

### Phase 2: Catalog Functionality
1. Implement BackgroundGrid with 5x3 layout
2. Add pagination controls
3. Create background selection logic
4. Implement authentication checks
5. Add integration with Editor Studio

### Phase 3: Pricing Page
1. Design pricing cards with proper styling
2. Implement feature comparison
3. Add payment flow placeholders
4. Create FAQ and testimonials sections

### Phase 4: Polish & Optimization
1. Add loading states and error handling
2. Implement responsive design
3. Add animations and transitions
4. Test integration points
5. Optimize performance

## Technical Considerations

### Authentication Flow
- Check authentication status when applying backgrounds
- Redirect to login if not authenticated
- Store selected background to apply after login

### State Management
- Use React Context or local state for catalog management
- Persist selected background in sessionStorage
- Clear selection after applying to editor

### Responsive Design
- Mobile-first approach
- Adjust grid columns based on screen size
- Touch-friendly buttons and interactions

### Performance
- Lazy load background images
- Implement image optimization
- Use placeholder/skeleton loading states

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- High contrast mode support

## API Requirements

### Background Images API
```
GET /api/backgrounds?page=1&limit=15
Response: {
  backgrounds: BackgroundImage[],
  totalPages: 3,
  currentPage: 1
}
```

### Subscription API
```
POST /api/subscriptions
Body: {
  plan: 'basic' | 'premium',
  paymentMethod: PaymentMethod
}
```

### User Authentication Check
```
GET /api/auth/status
Response: {
  isAuthenticated: boolean,
  user?: User
}
```

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Authentication checks
- Pagination logic

### Integration Tests
- Catalog to Editor Studio flow
- Payment process
- Authentication redirects

### User Testing
- Background selection workflow
- Payment flow
- Mobile responsiveness

## Future Enhancements

1. Background categories and filters
2. Background search functionality
3. User-uploaded backgrounds
4. Subscription management dashboard
5. Promotional codes and discounts
6. Annual billing options
7. Team/enterprise plans