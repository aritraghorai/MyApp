/**
 * Template Engine Utility
 * Renders note templates with variable substitution
 */

import { format } from "date-fns";

export interface TemplateVariables {
    date?: Date;
    [key: string]: any;
}

/**
 * Get default template variables based on current date/time
 */
export function getDefaultVariables(date: Date = new Date()): Record<string, string> {
    return {
        date: format(date, "yyyy-MM-dd"),
        fullDate: format(date, "EEEE, MMMM d, yyyy"),
        day: format(date, "EEEE"),
        shortDay: format(date, "EEE"),
        month: format(date, "MMMM"),
        shortMonth: format(date, "MMM"),
        year: format(date, "yyyy"),
        time: format(date, "h:mm a"),
        time24: format(date, "HH:mm"),
        week: format(date, "w"),
        dayOfMonth: format(date, "d"),
        dayOfYear: format(date, "DDD"),
    };
}

/**
 * Render template with variable substitution
 * Supports {{variableName}} syntax
 */
export function renderTemplate(
    template: string,
    customVariables: TemplateVariables = {}
): string {
    const date = customVariables.date || new Date();
    const defaultVars = getDefaultVariables(date);

    // Merge default and custom variables
    const variables = { ...defaultVars, ...customVariables };

    // Replace all {{variable}} occurrences
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] !== undefined ? String(variables[varName]) : match;
    });
}

/**
 * Validate template syntax
 * Returns array of errors, empty if valid
 */
export function validateTemplate(template: string): string[] {
    const errors: string[] = [];

    // Check for unclosed variables
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;

    if (openBraces !== closeBraces) {
        errors.push("Unclosed template variable detected");
    }

    // Check for invalid variable names
    const variableRegex = /\{\{(\w+)\}\}/g;
    let match;
    while ((match = variableRegex.exec(template)) !== null) {
        const varName = match[1];
        if (!/^[a-zA-Z0-9_]+$/.test(varName)) {
            errors.push(`Invalid variable name: ${varName}`);
        }
    }

    return errors;
}

/**
 * Extract variable names from template
 */
export function extractVariables(template: string): string[] {
    const variables = new Set<string>();
    const variableRegex = /\{\{(\w+)\}\}/g;

    let match;
    while ((match = variableRegex.exec(template)) !== null) {
        variables.add(match[1]);
    }

    return Array.from(variables);
}

/**
 * Pre-built template library
 */
export const DEFAULT_TEMPLATES = {
    dailyJournal: {
        name: "Daily Journal",
        category: "Personal",
        content: `# {{fullDate}}

## Mood: 

## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## Notes


## Gratitude
- 
- 
- 

## Tomorrow's Focus
- 
`,
    },

    meetingNotes: {
        name: "Meeting Notes",
        category: "Work",
        content: `# Meeting Notes - {{date}}

**Date:** {{fullDate}}
**Time:** {{time}}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion


## Action Items
- [ ] 
- [ ] 

## Next Steps


`,
    },

    dailyStandup: {
        name: "Daily Standup",
        category: "Work",
        content: `# Daily Standup - {{day}}, {{shortMonth}} {{dayOfMonth}}

## Yesterday
- 

## Today
- [ ] 
- [ ] 

## Blockers
- 

`,
    },

    weeklyReview: {
        name: "Weekly Review",
        category: "Personal",
        content: `# Weekly Review - Week {{week}}, {{year}}

## Wins This Week
- 
- 
- 

## Challenges
- 
- 

## Lessons Learned


## Next Week's Priorities
1. 
2. 
3. 

## Notes


`,
    },

    gratitudeLog: {
        name: "Gratitude Log",
        category: "Personal",
        content: `# Gratitude - {{fullDate}}

## Three Things I'm Grateful For
1. 
2. 
3. 

## Why?


## Reflection


`,
    },

    projectPlanning: {
        name: "Project Planning",
        category: "Work",
        content: `# Project Planning - {{date}}

## Project Name


## Objective


## Key Milestones
- [ ] 
- [ ] 
- [ ] 

## Resources Needed
- 

## Timeline


## Risks & Mitigation


## Next Actions
- [ ] 
- [ ] 

`,
    },
};
