# Todo Components Atomic Refactoring Plan

## Current Problems
1. **Code Duplication**: `AllTodos` and `TodoDashboard` have duplicate code:
   - Priority colors/badges (duplicated constants)
   - Stats cards (similar UI)
   - Todo item rendering (similar structure)
   - Empty states (similar)
   - Loading states (similar)

2. **No Reusability**: Hard to maintain when changes needed in both places

## Atomic Refactoring Strategy

### Shared Constants/Types
**Location:** `src/types/mindspace/todo.types.ts`
- Todo types
- Priority types
- Priority color mappings

### Atoms
**Location:** `src/components/mindspace/atoms/`
1. **TodoCheckbox** - Checkbox icon (completed/uncompleted)
2. **PriorityBadge** - Priority label badge
3. **TodoEmptyState** - Empty state message

### Molecules
**Location:** `src/components/mindspace/molecules/`
1. **TodoStatCard** - Individual stat card (reusable for total/active/rate)
2. **TodoFilterButtons** - Filter toggle buttons (all/active/completed)
3. **TodoItem** - Single todo item with checkbox, content, priority, delete

### Organisms
**Location:** `src/components/mindspace/organisms/`
1. **TodoStats** - Collection of stat cards
2. **TodoList** - List of todo items
3. **AllTodos** - Refactored to use molecules/atoms
4. **TodoDashboard** - Refactored to use molecules/atoms

## Benefits
✅ **DRY**: No duplicate code
✅ **Reusable**: Components can be used anywhere
✅ **Maintainable**: Changes in one place
✅ **Testable**: Small components easy to test
✅ **Consistent**: Same UI/UX across app
