# MedTech Mesh

> Built with ❤️ for the medical technology

A modern 3D medical model sharing platform built with Next.js, Redux, and TypeScript. MedTech Mesh allows healthcare professionals, educators, and researchers to share, discover, and collaborate on 3D medical models for education and research purposes.

## 🚀 Features

- **3D Model Sharing**: Upload and share medical 3D models
- **Advanced Search**: Search models with infinite scroll pagination
- **User Authentication**: Secure login/signup with GitHub and Google OAuth
- **Profile Management**: User profiles with model collections
- **Interactive UI**: Modern, responsive design with smooth animations
- **Real-time Updates**: Redux state management for seamless user experience

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 19](https://react.dev/)** - UI library

### State Management
- **[@reduxjs/toolkit](https://redux-toolkit.js.org/)** - Modern Redux with RTK
- **[react-redux](https://react-redux.js.org/)** - React bindings for Redux

### UI Components & Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives:
  - `@radix-ui/react-avatar` - Avatar component
  - `@radix-ui/react-checkbox` - Checkbox component
  - `@radix-ui/react-dialog` - Modal/Dialog component
  - `@radix-ui/react-dropdown-menu` - Dropdown menu component
  - `@radix-ui/react-label` - Label component
  - `@radix-ui/react-navigation-menu` - Navigation component
  - `@radix-ui/react-radio-group` - Radio button component
  - `@radix-ui/react-slot` - Slot component for composition
- **[class-variance-authority](https://cva.style/)** - Component variant utilities
- **[clsx](https://github.com/lukeed/clsx)** - Conditional CSS classes
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes
- **[tw-animate-css](https://github.com/jjranalli/tw-animate-css)** - Tailwind animations

### 3D Graphics
- **[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[@react-three/drei](https://docs.pmnd.rs/drei)** - Useful helpers for react-three-fiber
- **[three](https://threejs.org/)** - 3D graphics library

### Icons & Fonts
- **[lucide-react](https://lucide.dev/)** - Beautiful & consistent icon toolkit
- **[react-icons](https://react-icons.github.io/react-icons/)** - Popular icon libraries
- **[Geist Font](https://vercel.com/font)** - Modern font family by Vercel

### Development Tools
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[PostCSS](https://postcss.org/)** - CSS processing tool
- **[@tailwindcss/postcss](https://tailwindcss.com/docs/installation/using-postcss)** - Tailwind CSS PostCSS plugin

## 📦 Dependencies

### Production Dependencies
```json
{
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.2",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-dropdown-menu": "^2.1.15",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-navigation-menu": "^1.2.13",
  "@radix-ui/react-radio-group": "^1.3.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@react-three/drei": "^10.3.0",
  "@react-three/fiber": "^9.1.2",
  "@reduxjs/toolkit": "^2.8.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.462.0",
  "next": "15.1.4",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "react-icons": "^5.4.0",
  "react-redux": "^9.1.2",
  "tailwind-merge": "^2.5.5",
  "three": "^0.172.0"
}
```

### Development Dependencies
```json
{
  "@eslint/eslintrc": "^3",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/three": "^0.172.0",
  "eslint": "^9",
  "eslint-config-next": "15.1.4",
  "postcss": "^8",
  "tailwindcss": "^4",
  "tw-animate-css": "^1.3.4",
  "typescript": "^5"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medmesh
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Project Structure

```
medmesh/
├── app/                    # Next.js App Router pages
│   ├── edit/              # Edit model page
│   ├── product/           # Product detail page
│   ├── profile/           # User profile page
│   ├── settings/          # Settings page
│   ├── upload/            # Upload model page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── skeletons/         # Loading skeleton components
│   ├── upload/            # Upload form components
│   ├── ui/                # UI primitives
│   └── ...
├── lib/                   # Utility functions and configurations
│   ├── features/          # Redux slices
│   ├── hooks/             # Custom React hooks
│   └── utils.ts           # Helper functions
├── public/                # Static assets
├── types/                 # TypeScript type definitions
└── ...
```

## 🎨 Features Overview

### Authentication System
- Email/password authentication
- OAuth integration (GitHub, Google)
- User session management with Redux

### 3D Model Management
- File upload with drag & drop
- Image gallery for model previews
- Model information forms
- License and visibility settings

### Search & Discovery
- Real-time search functionality
- Infinite scroll pagination
- Filter and sort options
- Category-based browsing

### User Experience
- Responsive design for all devices
- Loading states with skeleton screens
- Smooth animations and transitions
- Accessibility-compliant UI components

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Sepuluh Nopember Institute License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Three.js Documentation](https://threejs.org/docs/)
