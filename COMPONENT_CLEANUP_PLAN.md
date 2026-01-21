# Component Cleanup Plan

## Current Status (11 files)

### Files Being Used:
1. ✅ **-HabitsView.tsx** - Used in HabitsViewTemplate
2. ✅ **-MoodSelector.tsx** - Used in NoteViewTemplate
3. ✅ **-TemplatePicker.tsx** - Used in NoteViewTemplate
4. ✅ **-TodoDashboard.tsx** - Used in NoteSidebar
5. ✅ **-HabitTracker.tsx** - Used in NoteSidebar
6. ✅ **-MarkdownToolbar.tsx** - Used in NoteEditor
7. ✅ **-HabitManager.tsx** - Uses MetadataFieldsEditor (transitive dependency)
8. ✅ **-MetadataFieldsEditor.tsx** - Used by HabitManager
9. ✅ **-MetadataInput.tsx** - Used by HabitTracker

### Files to Remove:
1. ❌ **-KeyboardShortcutsDialog.tsx** - No longer imported (user removed it)
2. ❌ **-Analytics.tsx** - NOT being used anywhere

### Missing Files:
1. ⚠️ **-AllTodos.tsx** - Referenced in TodosViewTemplate but missing!

## Actions:

1. **Delete unused files:**
   - Remove `-KeyboardShortcutsDialog.tsx`
   - Remove `-Analytics.tsx` (check if used first)

2. **Create missing file:**
   - Create `-AllTodos.tsx` (or update TodosViewTemplate to use a different component)

3. **Verify all imports** after cleanup
