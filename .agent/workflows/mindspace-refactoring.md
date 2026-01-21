---
description: Mindspace Atomic Design Refactoring Plan
---

# Mindspace Refactoring to Atomic Design

## Overview
Refactor the mindspace codebase from a single 629-line monolithic component to a clean, maintainable structure using React Atomic Design principles.

## Current Problems
- Single massive 629-line component (`index.tsx`)
- Flat component structure with no hierarchy
- Mixed concerns (UI, business logic, state management)
- Difficult to test and maintain
- Hard to reuse components

## Atomic Design Structure

### Layer 1: Atoms (Smallest UI elements)
**Location**: `src/components/mindspace/atoms/`

- `SaveIndicator.tsx` - Shows saving/saved status
- `DateNavigationButton.tsx` - Previous/Next day buttons
- `ViewModeButton.tsx` - Individual view mode toggle button
- `LoadingSpinner.tsx` - Loading state indicator
- `EmptyState.tsx` - Generic empty state message
- `Emoji.tsx` - Emoji display component
- `MoodEmoji.tsx` - Individual mood emoji button

### Layer 2: Molecules (Simple combinations of atoms)
**Location**: `src/components/mindspace/molecules/`

- `DateNavigation.tsx` - Date picker with prev/next buttons
- `ViewModeToggle.tsx` - Complete view mode toggle bar (Note/List/Tasks/Habits)
- `SaveStatusBadge.tsx` - Save indicator with icon and text
- `NoteCard.tsx` - Individual note card in list view
- `HistoryCard.tsx` - Individual history version card
- `MoodScale.tsx` - Complete mood selector with all emojis
- `SidebarNavigation.tsx` - Sidebar view switcher (Todos/Habits)

### Layer 3: Organisms (Complex UI sections)
**Location**: `src/components/mindspace/organisms/`

- `NoteHeader.tsx` - Complete header with title, view toggle, date nav
- `NoteEditor.tsx` - Markdown editor with toolbar
- `NoteListView.tsx` - Grid of recent notes
- `NoteSidebar.tsx` - Complete sidebar with todos/habits
- `HistoryDialog.tsx` - Version history modal
- `TipsSection.tsx` - Tips and help section

### Layer 4: Templates (Page layouts)
**Location**: `src/components/mindspace/templates/`

- `NoteViewTemplate.tsx` - Layout for note editing view
- `ListViewTemplate.tsx` - Layout for list view
- `TodosViewTemplate.tsx` - Layout for todos view
- `HabitsViewTemplate.tsx` - Layout for habits view

### Layer 5: Pages (Route components)
**Location**: `src/routes/_authed/notes/`

- `index.tsx` - Main route component (orchestrator only)

## Hooks (Custom business logic)
**Location**: `src/hooks/mindspace/`

- `useNoteData.ts` - Fetch and manage note data
- `useNoteHistory.ts` - Fetch and manage version history
- `useRecentNotes.ts` - Fetch recent notes for list view
- `useNoteSave.ts` - Handle note saving logic
- `useDateNavigation.ts` - Handle date selection and navigation
- `useNoteState.ts` - Manage local note state (content, mood)

## Types
**Location**: `src/types/mindspace/`

- `note.types.ts` - Note-related types
- `view.types.ts` - View mode and sidebar types

## Utils
**Location**: `src/lib/mindspace/`

- `noteFormatters.ts` - Formatting utilities
- `noteValidation.ts` - Validation utilities

## Migration Steps

1. **Create directory structure**
2. **Extract types** - Move all TypeScript types to dedicated files
3. **Extract utilities** - Move helper functions
4. **Create custom hooks** - Extract data fetching and state management
5. **Build atoms** - Create smallest reusable components
6. **Build molecules** - Compose atoms into meaningful groups
7. **Build organisms** - Create complex sections
8. **Create templates** - Build page layouts
9. **Refactor main page** - Simplify to orchestrator only
10. **Clean up old components** - Remove unused files
11. **Test and verify** - Ensure all functionality works

## Benefits

✅ **Better Organization** - Clear hierarchy and responsibility
✅ **Reusability** - Components can be used across the app
✅ **Testability** - Smaller, focused components are easier to test
✅ **Maintainability** - Easy to locate and modify specific features
✅ **Scalability** - New features can be added without bloating files
✅ **Developer Experience** - Easier to understand and navigate
✅ **Performance** - Better code splitting and lazy loading opportunities
