# System Flow Diagram

## Catalog & Pricing Integration Flow

```mermaid
graph TD
    A[Home Page] -->|Click Templates| B(Catalog Page)
    A -->|Click Pricing| C(Pricing Page)
    
    B --> D[Background Grid 5x3]
    D --> E[Background Preview Modal]
    E --> F{User Authenticated?}
    F -->|Yes| G[Apply to Editor Studio]
    F -->|No| H[Login/Register]
    H --> G
    G --> I[Editor Studio]
    I --> J[Update Background Image]
    
    C --> K[Pricing Cards 2x1]
    K --> L[Basic Plan RM27.90]
    K --> M[Premium Plan RM57.90]
    L --> N[Payment Flow]
    M --> N
    N --> O[Subscription Active]
    O --> P[Access to Premium Features]
    
    I --> Q[Save Changes]
    Q --> R[Dashboard]
    R --> S[Manage Invitations]
    S --> T[View Live Invitation]
```

## User Journey Flow

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant CatalogPage
    participant EditorStudio
    participant Auth
    participant PricingPage
    participant Payment
    
    User->>HomePage: Visits website
    User->>HomePage: Clicks Templates
    HomePage->>CatalogPage: Navigate to /catalog
    CatalogPage->>User: Shows background grid
    User->>CatalogPage: Selects background
    CatalogPage->>User: Shows preview modal
    User->>CatalogPage: Clicks Apply
    CatalogPage->>Auth: Check authentication
    alt Not Authenticated
        Auth->>CatalogPage: Return false
        CatalogPage->>User: Redirect to login
        User->>Auth: Login/Register
        Auth->>CatalogPage: Return authenticated
    end
    CatalogPage->>EditorStudio: Navigate with selected background
    EditorStudio->>User: Shows editor with background applied
    User->>EditorStudio: Customizes invitation
    EditorStudio->>User: Saves changes
    
    Note over User,Payment: Alternative path for pricing
    User->>HomePage: Clicks Pricing
    HomePage->>PricingPage: Navigate to /pricing
    PricingPage->>User: Shows plan comparison
    User->>PricingPage: Selects plan
    PricingPage->>Payment: Initiate payment flow
    Payment->>User: Process payment
    Payment->>User: Confirm subscription
```

## Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> Router[HashRouter]
    Router --> Routes[Routes]
    Routes --> Navbar[Navbar.tsx]
    Routes --> HomeRoute[Route path=/]
    Routes --> CatalogRoute[Route path=/catalog]
    Routes --> PricingRoute[Route path=/pricing]
    Routes --> DashboardRoute[Route path=/dashboard]
    Routes --> EditorRoute[Route path=/edit/:id]
    
    CatalogRoute --> CatalogPage[CatalogPage.tsx]
    CatalogPage --> BackgroundGrid[BackgroundGrid.tsx]
    BackgroundGrid --> BackgroundCard[BackgroundCard.tsx]
    CatalogPage --> Pagination[Pagination.tsx]
    CatalogPage --> PreviewModal[BackgroundPreview.tsx]
    
    PricingRoute --> PricingPage[PricingPage.tsx]
    PricingPage --> PricingCard[PricingCard.tsx]
    PricingPage --> FeatureComparison[FeatureComparison.tsx]
    PricingPage --> PaymentModal[PaymentModal.tsx]
    
    EditorRoute --> Editor[Editor.tsx]
    Editor --> TabButton[TabButton.tsx]
    Editor --> MediaTab[Media Tab Content]
    MediaTab --> BackgroundInput[Background Image Input]
```

## State Management Flow

```mermaid
graph LR
    A[Catalog Selection] --> B[SessionStorage]
    B --> C[Editor Studio Load]
    C --> D[Update Invitation State]
    D --> E[Save to Backend]
    
    F[Pricing Selection] --> G[Payment Service]
    G --> H[Subscription State]
    H --> I[User Context]
    I --> J[Feature Access Control]
```

## Authentication Flow

```mermaid
graph TD
    A[User Action] --> B{Requires Auth?}
    B -->|No| C[Execute Action]
    B -->|Yes| D{Is Authenticated?}
    D -->|Yes| C
    D -->|No| E[Show Login Modal]
    E --> F[User Login]
    F --> G{Login Success?}
    G -->|Yes| H[Update Auth State]
    G -->|No| I[Show Error]
    H --> C
    I --> E
```

## Background Selection Flow

```mermaid
graph TD
    A[User Views Catalog] --> B[Selects Background]
    B --> C[Preview Modal Opens]
    C --> D[Clicks Apply Button]
    D --> E[Check Authentication]
    E -->|Not Authenticated| F[Redirect to Login]
    F --> G[After Login]
    E -->|Authenticated| G
    G --> H[Navigate to Editor]
    H --> I[Pass Background ID in State]
    I --> J[Editor Loads Background]
    J --> K[Update background_image field]
    K --> L[User Can Customize]
    L --> M[Save Invitation]