# Mindspace Component System

A well-organized, maintainable component architecture for the Mindspace feature using **Atomic Design** principles.

## 📁 Structure

```
mindspace/
├── atoms/          # 5 smallest UI elements
├── molecules/      # 5 component combinations  
├── organisms/      # 6 complex sections
├── templates/      # 4 page layouts
└── index.ts        # Barrel exports
```

## 🎯 Quick Start

### Import Components

```tsx
// Import specific components
import { NoteHeader, NoteEditor } from '@/components/mindspace';

// Or import from specific layers
import { SaveIndicator } from '@/components/mindspace/atoms/SaveIndicator';
import { DateNavigation } from '@/components/mindspace/molecules/DateNavigation';
```

### Import Hooks

```tsx
import { useNoteData, useNoteSave } from '@/hooks/mindspace';

// Or specific hooks
import { useNoteData } from '@/hooks/mindspace/useNoteData';
```

### Import Types

```tsx
import type { ViewMode, Note } from '@/types/mindspace';
```

## 📚 Component Reference

### Atoms (Building Blocks)

#### SaveIndicator
Shows current save status (saving/saved).

```tsx
import { SaveIndicator } from '@/components/mindspace';

<SaveIndicator status="saving" />
<SaveIndicator status="saved" />
```

#### DateNavigationButton
Navigation button for prev/next day.

```tsx
import { DateNavigationButton } from '@/components/mindspace';

<DateNavigationButton direction="prev" onClick={handlePrev} />
<DateNavigationButton direction="next" onClick={handleNext} />
```

#### ViewModeButton
Individual view mode toggle button.

```tsx
import { ViewModeButton } from '@/components/mindspace';

<ViewModeButton 
  icon={FileText}
  label="Note"
  isActive={true}
  onClick={() => setMode('note')}
/>
```

#### LoadingSpinner
Loading state indicator.

```tsx
import { LoadingSpinner } from '@/components/mindspace';

<LoadingSpinner message="Loading note..." />
```

#### EmptyState
Generic empty state display.

```tsx
import { EmptyState } from '@/components/mindspace';

<EmptyState 
  icon={FileText}
  message="No notes found"
/>
```

---

### Molecules (Combinations)

#### DateNavigation
Complete date picker with prev/next buttons.

```tsx
import { DateNavigation } from '@/components/mindspace';

<DateNavigation
  selectedDate={date}
  calendarOpen={open}
  onCalendarOpenChange={setOpen}
  onDateSelect={handleSelect}
  onPrevDay={handlePrev}
  onNextDay={handleNext}
/>
```

#### ViewModeToggle
Full view mode toggle bar.

```tsx
import { ViewModeToggle } from '@/components/mindspace';

<ViewModeToggle 
  currentMode={viewMode}
  onModeChange={setViewMode}
/>
```

#### NoteCard
Individual note card for list view.

```tsx
import { NoteCard } from '@/components/mindspace';

<NoteCard 
  note={noteData}
  onClick={() => handleClick(note.date)}
/>
```

#### HistoryCard
Individual history version card.

```tsx
import { HistoryCard } from '@/components/mindspace';

<HistoryCard 
  history={historyItem}
  onRestore={handleRestore}
/>
```

#### SidebarNavigation
Sidebar view switcher.

```tsx
import { SidebarNavigation } from '@/components/mindspace';

<SidebarNavigation 
  currentView={sidebarView}
  onViewChange={setSidebarView}
/>
```

---

### Organisms (Complex Sections)

#### NoteHeader
Complete header with all controls.

```tsx
import { NoteHeader } from '@/components/mindspace';

<NoteHeader
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  selectedDate={date}
  // ... other props
/>
```

#### NoteEditor
Full markdown editor with toolbar.

```tsx
import { NoteEditor } from '@/components/mindspace';

<NoteEditor
  content={content}
  onContentChange={setContent}
  isLoading={false}
  theme="light"
  onShowShortcuts={() => {}}
/>
```

#### NoteListView
Grid of recent notes.

```tsx
import { NoteListView } from '@/components/mindspace';

<NoteListView 
  notes={recentNotes}
  onNoteClick={handleNoteClick}
/>
```

#### NoteSidebar
Complete sidebar with todos/habits.

```tsx
import { NoteSidebar } from '@/components/mindspace';

<NoteSidebar
  sidebarView={view}
  onSidebarViewChange={setView}
  noteId={noteId}
  // ... other props
/>
```

#### HistoryDialog
Version history modal.

```tsx
import { HistoryDialog } from '@/components/mindspace';

<HistoryDialog
  open={showHistory}
  onOpenChange={setShowHistory}
  history={historyData}
  selectedDate={date}
  onRestore={handleRestore}
/>
```

---

### Templates (Page Layouts)

#### NoteViewTemplate
Layout for note editing view.

```tsx
import { NoteViewTemplate } from '@/components/mindspace';

<NoteViewTemplate
  viewMode={viewMode}
  // ... all required props
/>
```

#### ListViewTemplate
Layout for notes list view.

```tsx
import { ListViewTemplate } from '@/components/mindspace';

<ListViewTemplate
  viewMode={viewMode}
  notes={notes}
  onNoteClick={handleClick}
/>
```

#### TodosViewTemplate
Layout for todos view.

```tsx
import { TodosViewTemplate } from '@/components/mindspace';

<TodosViewTemplate 
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

#### HabitsViewTemplate
Layout for habits view.

```tsx
import { HabitsViewTemplate } from '@/components/mindspace';

<HabitsViewTemplate
  viewMode={viewMode}
  selectedDate={date}
/>
```

---

## 🔧 Hooks Reference

### useNoteData
Fetch note for a specific date.

```tsx
import { useNoteData } from '@/hooks/mindspace';

const { data: note, isLoading } = useNoteData(selectedDate);
```

### useRecentNotes
Fetch recent notes for list view.

```tsx
import { useRecentNotes } from '@/hooks/mindspace';

const { data: notes } = useRecentNotes(enabled);
```

### useNoteHistory
Fetch version history.

```tsx
import { useNoteHistory } from '@/hooks/mindspace';

const { data: history, refetch } = useNoteHistory({ 
  noteId, 
  enabled: showHistory 
});
```

### useNoteSave
Handle note saving logic.

```tsx
import { useNoteSave } from '@/hooks/mindspace';

const { handleSave, saveStatus } = useNoteSave({ 
  selectedDate, 
  noteId 
});
```

### useDateNavigation
Manage date selection and navigation.

```tsx
import { useDateNavigation } from '@/hooks/mindspace';

const {
  selectedDate,
  calendarOpen,
  handleDateSelect,
  handlePrevDay,
  handleNextDay
} = useDateNavigation();
```

### useNoteState
Manage local note state with auto-save.

```tsx
import { useNoteState } from '@/hooks/mindspace';

const { 
  content, 
  mood, 
  setMood,
  handleContentChange,
  handleTemplateApply
} = useNoteState({ note, onAutoSave: handleSave });
```

---

## 📝 Types Reference

### ViewMode
```typescript
type ViewMode = "note" | "list" | "habits" | "todos";
```

### SidebarView
```typescript
type SidebarView = "todos" | "habits" | "info";
```

### SaveStatus
```typescript
type SaveStatus = "idle" | "saving" | "saved";
```

### Note
```typescript
interface Note {
  id: string;
  date: string;
  content: string;
  mood: number | null;
  createdAt: string;
  updatedAt: string;
}
```

### NoteHistory
```typescript
interface NoteHistory {
  id: string;
  content: string;
  createdAt: string;
}
```

### NoteListItem
```typescript
interface NoteListItem {
  id: string;
  date: string;
  content: string;
  updatedAt: string;
}
```

---

## 🛠️ Utilities

### formatDateTime
Format date string to human-readable format.

```tsx
import { formatDateTime } from '@/lib/mindspace/noteFormatters';

const formatted = formatDateTime("2024-01-20T10:30:00");
// Returns: "1/20/2024, 10:30:00 AM"
```

### truncateContent
Truncate text with ellipsis.

```tsx
import { truncateContent } from '@/lib/mindspace/noteFormatters';

const short = truncateContent("Long text here...", 50);
// Returns: "Long text here..." (max 50 chars)
```

---

## 🎨 Design Principles

### Atomic Design Hierarchy

1. **Atoms** → Smallest units (buttons, inputs, icons)
2. **Molecules** → Simple groups (form fields, cards)
3. **Organisms** → Complex sections (headers, sidebars)
4. **Templates** → Page layouts
5. **Pages** → Route components

### Component Rules

- ✅ **Single Responsibility**: Each component does one thing well
- ✅ **Composition**: Build complex UIs from simple parts
- ✅ **Reusability**: Components can be used anywhere
- ✅ **Testability**: Small components are easy to test
- ✅ **Maintainability**: Clear structure, easy to modify

---

## 🧪 Testing Guide

### Test Atoms

```tsx
import { render, screen } from '@testing-library/react';
import { SaveIndicator } from '@/components/mindspace/atoms/SaveIndicator';

test('shows saving state', () => {
  render(<SaveIndicator status="saving" />);
  expect(screen.getByText('Saving...')).toBeInTheDocument();
});
```

### Test Molecules

```tsx
import { render, fireEvent } from '@testing-library/react';
import { ViewModeToggle } from '@/components/mindspace/molecules/ViewModeToggle';

test('calls onModeChange when clicked', () => {
  const handleChange = vi.fn();
  const { getByText } = render(
    <ViewModeToggle currentMode="note" onModeChange={handleChange} />
  );
  
  fireEvent.click(getByText('List'));
  expect(handleChange).toHaveBeenCalledWith('list');
});
```

### Test Hooks

```tsx
import { renderHook } from '@testing-library/react';
import { useDateNavigation } from '@/hooks/mindspace/useDateNavigation';

test('navigates to next day', () => {
  const { result } = renderHook(() => useDateNavigation());
  
  act(() => {
    result.current.handleNextDay();
  });
  
  // Assert date changed
});
```

---

## 📖 Best Practices

### Do's ✅
- Import from barrel files (`@/components/mindspace`)
- Use TypeScript types for all props
- Keep components focused and small
- Extract complex logic to hooks
- Write descriptive component names
- Document complex logic

### Don'ts ❌
- Don't create god components
- Don't mix business logic in UI components
- Don't skip prop types
- Don't ignore accessibility
- Don't inline complex computations

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add unit tests for all components
- [ ] Add Storybook for component documentation
- [ ] Implement lazy loading for templates
- [ ] Add error boundaries
- [ ] Create design tokens
- [ ] Add animation variants
- [ ] Implement accessibility improvements

---

## 📚 Additional Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Component Patterns](https://www.patterns.dev/posts/react-patterns/)
- [Component-Driven Development](https://www.componentdriven.org/)

---

**Built with ❤️ using Atomic Design principles**
