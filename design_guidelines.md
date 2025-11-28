# Design Guidelines for TheFabulous.co Exact Replica

## Design Approach
**Exact Replication Mandate**: This is a precise copy of TheFabulous.co - every visual detail, layout pattern, spacing, and interaction must match the original website exactly. No creative interpretation or modern alternatives.

## Layout System
- **Container Strategy**: Full-width sections with centered content containers (max-width ~1200px)
- **Spacing Units**: Use Tailwind's default scale, focusing on: `p-4`, `p-6`, `p-8`, `p-12`, `p-16`, `p-20`, `py-12`, `py-16`, `py-20` for section padding
- **Grid Patterns**: 
  - Awards section: 3-column grid on desktop, stacked on mobile
  - Features: Alternating 2-column layouts (image-text, text-image pattern)
  - Footer links: Multi-column grid layout

## Typography Hierarchy
- **Hero Headline**: Very large, bold weight (~text-5xl to text-6xl), dark text
- **Section Headers**: Large, bold (~text-3xl to text-4xl), consistent spacing below
- **Body Text**: Medium size (~text-base to text-lg), comfortable line-height for readability
- **Button Text**: Medium weight, all-caps not used, clear and readable
- **Font Selection**: Modern sans-serif via Google Fonts (similar to system fonts, clean and professional)

## Color Palette
- **Primary Brand**: Purple/blue gradient tones (vibrant purples, deep blues)
- **Accent**: Warm sand/beige tones for secondary elements
- **Background**: Clean white for main sections, subtle off-white/sand for alternating sections
- **Text**: Dark charcoal/black for primary text, medium gray for secondary text
- **CTA Buttons**: Gradient purple-to-blue with white text

## Component Library

### Navigation
- **Top Header**: Multi-app navigation strip with small logo tiles (Fabulous, Shape, Clarify, Mind, Elixir, Sleep)
- **Main Nav**: Logo (left) + links (right): "Science" and "Sign in"
- **Mobile Menu**: Hamburger icon triggering full-screen dark overlay menu with navigation options

### Hero Section
- **Primary Hero**: Large headline + descriptive subtext + interactive dropdown form
- **Dropdown Form**: "How can Fabulous help you?" with 5 options in styled select/accordion
- **CTA Button**: Prominent gradient button "Start your journey"

### Awards Section
- **Desktop**: Horizontal 3-item showcase with icon + title + subtitle
- **Mobile**: Vertical stack, same content
- **Styling**: Icons above text, clean card-like presentation

### Feature Blocks (6 total)
- **Pattern**: Alternating image-text layout (left-right, right-left)
- **Images**: Large feature screenshots/illustrations occupying ~50% width
- **Text Content**: Icon + headline + short description
- **Responsive**: Stack vertically on mobile, maintain image quality

### Science Section
- **Layout**: 2-column icon-text blocks explaining Duke University origins
- **Stat Callout**: "37M people helped" prominently displayed
- **Background**: Possibly different background treatment

### FAQ Accordion
- **5 Questions**: Expandable/collapsible with arrow indicators (up/down)
- **Interaction**: Click to expand, smooth animation
- **Styling**: Clean lines, adequate padding, clear visual hierarchy

### Community/CTA Sections
- **Background Images**: Full-width background imagery with text overlay
- **Content**: Centered headline + CTA button
- **Button Treatment**: Blurred background on buttons over images

### Footer
- **Logo Section**: Round Fabulous logo + company description
- **Link Grid**: Organized columns (About, Legal, Help, Company, Social)
- **Social Icons**: Instagram icons with labels for Fabulous and Shape
- **Styling**: Clean, organized, ample spacing

## Images
- **Hero Background**: Possible subtle background pattern or gradient
- **Top Navigation**: 6 small square logo images for app variants
- **Award Badges**: 3 official badge/icon images (App Store, Google Play, Material Design)
- **Feature Images**: 6 large product screenshots showing app interfaces and features
- **Science Icons**: 2 illustrated icons for science section
- **Community Section**: Full-width lifestyle/community background image
- **Bottom CTA**: Background image of app interface/person using app
- **Footer Logo**: Circular Fabulous brand logo

## Interactions & Animations
- **Minimal Animation**: Smooth scroll, subtle hover states on buttons
- **Dropdown/Accordion**: Smooth expand/collapse for form and FAQ
- **Button Hovers**: Slight brightness/shadow change
- **Mobile Menu**: Slide-in/fade-in animation for full-screen menu
- **No Aggressive Animations**: Keep it clean and professional

## Responsive Breakpoints
- **Mobile**: Single column, stacked layouts, full-width elements
- **Tablet**: Begin introducing 2-column layouts for features
- **Desktop**: Full multi-column grids, alternating layouts, optimal spacing

## Critical Implementation Notes
- Use exact image URLs from original site where possible
- Match gradient directions and color stops precisely
- Replicate exact text content and hierarchy
- Maintain original aspect ratios for all images
- Preserve exact navigation structure and links
- Keep all interactive elements functioning identically