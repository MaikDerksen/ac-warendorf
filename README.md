
# AC Warendorf Digital - Club Website

This is the official website for the Automobilclub Warendorf e. V. im ADAC, built with modern web technologies. The project is developed within Firebase Studio.

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Key Features](#key-features)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
- [Image Management](#image-management)
- [Styling](#styling)
- [Deployment](#deployment)
- [Firebase Studio](#firebase-studio-integration)

## Introduction

This Next.js application serves as the digital presence for the Automobilclub Warendorf. It provides information about the club, news, events, team members, and ways to get involved.

## Tech Stack

The project is built using the following technologies:

- **Next.js (v15+):** React framework for server-side rendering, static site generation, and App Router.
- **React (v18+):** JavaScript library for building user interfaces.
- **TypeScript:** Superset of JavaScript for static typing.
- **ShadCN UI:** Re-usable UI components built with Radix UI and Tailwind CSS.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Lucide React:** Library for beautiful and consistent icons.
- **Genkit (Firebase):** For integrating AI-powered features (planned).
- **Zod:** TypeScript-first schema declaration and validation.
- **React Hook Form:** For managing form state and validation.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository (if applicable) or ensure you have the project files.**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:9002`.

The Genkit development server can be run separately if you are working on AI flows:

```bash
npm run genkit:dev
# or for watching changes
npm run genkit:watch
```

## Key Features

- **Responsive Design:** Adapts to various screen sizes (desktop, tablet, mobile).
- **Dark Mode:** User-selectable dark and light themes.
- **Content Pages:**
    - Homepage with overview and latest news.
    - News archive and individual article pages.
    - Information about "Unser Verein" (Vorstand, Piloten, Oldie-Cup).
    - Details on "Kart-Slalom" activities.
    - Sponsor showcase.
    - Contact options, including "Mitglied werden" (Become a Member) and "Schutzkonzept" (Protection Concept).
    - Legal pages: Impressum, Datenschutz.
- **Admin Area (Placeholder):** Basic structure at `/admin` for future content management capabilities.
- **Image Management:** Local image hosting with a structured `public/images` directory.

## Folder Structure

A brief overview of the main project directories:

- **`public/`**: Contains static assets, including images in the `public/images/` subdirectory.
    - **`public/images/`**: Organized subfolders for logos, news, pilots, vorstand, etc.
- **`src/`**: Main application source code.
    - **`src/app/`**: Next.js App Router pages and layouts. Each folder typically represents a route.
    - **`src/components/`**: Reusable React components.
        - **`src/components/ui/`**: ShadCN UI components.
    - **`src/lib/`**: Utility functions, mock data, and helper modules.
    - **`src/ai/`**: Genkit related code for AI features.
        - **`src/ai/flows/`**: Genkit flows (example location, currently empty).
        - **`src/ai/genkit.ts`**: Genkit global configuration.
        - **`src/ai/dev.ts`**: Genkit development server entry point.
    - **`src/hooks/`**: Custom React hooks.
    - **`src/types/`**: TypeScript type definitions.
- **`.vscode/`**: VS Code editor settings.

## Available Scripts

The `package.json` file includes the following scripts:

- **`npm run dev`**: Starts the Next.js development server with Turbopack.
- **`npm run genkit:dev`**: Starts the Genkit development server.
- **`npm run genkit:watch`**: Starts the Genkit development server with file watching.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the production server (after building).
- **`npm run lint`**: Runs ESLint to check for code quality issues.
- **`npm run typecheck`**: Runs TypeScript compiler to check for type errors.

## Image Management

Images are stored locally within the `public/images/` directory. The structure is as follows:

- `public/images/general/`: For general site images.
- `public/images/logo/`: For site logos.
- `public/images/news/`: For news article images.
- `public/images/pilots/`: For pilot photos.
- `public/images/sponsoren/`: For sponsor logos.
- `public/images/vorstand/`: For board member photos.

When adding new images, place them in the appropriate subfolder and update the corresponding `src` paths in the components or mock data.

## Styling

- **ShadCN UI:** Components are pre-styled and customizable.
- **Tailwind CSS:** Used for utility classes and custom styling.
- **`src/app/globals.css`:** Contains base styles, Tailwind directives, and CSS variables for theming (including light and dark mode).
- **Fonts:** PT Sans (body) and Space Grotesk (headlines) are loaded from Google Fonts.

## Deployment

This project is configured for deployment on Firebase App Hosting. The `apphosting.yaml` file contains basic configuration for the hosting environment.

## Firebase Studio Integration

This project is designed to be used and modified within Firebase Studio, an AI-assisted development environment. Many changes can be made conversationally.
