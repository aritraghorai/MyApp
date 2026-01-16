import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HABIT_TEMPLATES } from "@/lib/habit-metadata";

interface MetadataField {
    name: string;
    type: string;
    label: string;
    unit?: string;
}

interface MetadataFieldsEditorProps {
    value: Record<string, string> | null;
    onChange: (schema: Record<string, string> | null) => void;
}

export function MetadataFieldsEditor({ value, onChange }: MetadataFieldsEditorProps) {
    const [fields, setFields] = useState<MetadataField[]>(() => {
        if (!value) return [];
        return Object.entries(value).map(([name, typeStr]) => {
            const [type, labelPart] = typeStr.split(":");
            let label = name;
            let unit: string | undefined;

            if (labelPart) {
                const match = labelPart.match(/(.+)\s*\((.+)\)/);
                if (match) {
                    label = match[1].trim();
                    unit = match[2].trim();
                } else {
                    label = labelPart;
                }
            }

            return { name, type, label, unit };
        });
    });

    const [newField, setNewField] = useState({
        name: "",
        type: "number",
        label: "",
        unit: "",
    });

    const updateSchema = (updatedFields: MetadataField[]) => {
        if (updatedFields.length === 0) {
            onChange(null);
            return;
        }

        const schema: Record<string, string> = {};
        for (const field of updatedFields) {
            let typeStr = field.type;
            if (field.label || field.unit) {
                const labelPart = field.unit ? `${field.label} (${field.unit})` : field.label;
                typeStr = `${field.type}:${labelPart}`;
            }
            schema[field.name] = typeStr;
        }
        onChange(schema);
    };

    const addField = () => {
        if (!newField.name || !newField.label) return;

        const updated = [...fields, { ...newField }];
        setFields(updated);
        updateSchema(updated);
        setNewField({ name: "", type: "number", label: "", unit: "" });
    };

    const removeField = (index: number) => {
        const updated = fields.filter((_, i) => i !== index);
        setFields(updated);
        updateSchema(updated);
    };

    const applyTemplate = (templateKey: string) => {
        const template = HABIT_TEMPLATES[templateKey as keyof typeof HABIT_TEMPLATES];
        if (!template) return;

        onChange(template.metadataSchema);

        // Parse template schema into fields
        const templateFields = Object.entries(template.metadataSchema).map(([name, typeStr]) => {
            const [type, labelPart] = typeStr.split(":");
            let label = name;
            let unit: string | undefined;

            if (labelPart) {
                const match = labelPart.match(/(.+)\s*\((.+)\)/);
                if (match) {
                    label = match[1].trim();
                    unit = match[2].trim();
                } else {
                    label = labelPart;
                }
            }

            return { name, type, label, unit };
        });

        setFields(templateFields);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Metadata Fields (Optional)</Label>
                <Select onValueChange={applyTemplate}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Use Template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="workout">💪 Workout</SelectItem>
                        <SelectItem value="leetcode">💻 LeetCode</SelectItem>
                        <SelectItem value="reading">📚 Reading</SelectItem>
                        <SelectItem value="running">🏃 Running</SelectItem>
                        <SelectItem value="meditation">🧘 Meditation</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Existing Fields */}
            {fields.length > 0 && (
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <span className="font-medium">{field.label}</span>
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                    {field.type}
                                    {field.unit && ` (${field.unit})`}
                                </div>
                                <div className="text-gray-400 dark:text-gray-500 text-xs">
                                    {field.name}
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeField(index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Field */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add Metadata Field
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="field-label" className="text-xs">
                            Label *
                        </Label>
                        <Input
                            id="field-label"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            placeholder="e.g., Weight"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="field-name" className="text-xs">
                            Field Name *
                        </Label>
                        <Input
                            id="field-name"
                            value={newField.name}
                            onChange={(e) =>
                                setNewField({
                                    ...newField,
                                    name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                })
                            }
                            placeholder="e.g., weight"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="field-type" className="text-xs">
                            Type
                        </Label>
                        <Select
                            value={newField.type}
                            onValueChange={(value) => setNewField({ ...newField, type: value })}
                        >
                            <SelectTrigger id="field-type" className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="field-unit" className="text-xs">
                            Unit (optional)
                        </Label>
                        <Input
                            id="field-unit"
                            value={newField.unit}
                            onChange={(e) => setNewField({ ...newField, unit: e.target.value })}
                            placeholder="e.g., kg, min"
                            className="mt-1"
                        />
                    </div>
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={addField}
                    disabled={!newField.name || !newField.label}
                    className="w-full"
                >
                    <Plus size={16} className="mr-1" />
                    Add Field
                </Button>
            </div>

            {fields.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    No metadata fields defined. Use a template or add custom fields to track metrics.
                </p>
            )}
        </div>
    );
}
