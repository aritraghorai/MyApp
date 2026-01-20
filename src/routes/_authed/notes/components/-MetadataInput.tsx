import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface MetadataInputProps {
	schema: Record<string, string> | null;
	value: Record<string, any> | null;
	onChange: (metadata: Record<string, any> | null) => void;
}

export function MetadataInput({ schema, value, onChange }: MetadataInputProps) {
	if (!schema || Object.keys(schema).length === 0) {
		return null;
	}

	const handleFieldChange = (fieldName: string, fieldValue: any) => {
		const updated = { ...(value || {}), [fieldName]: fieldValue };
		onChange(updated);
	};

	return (
		<div className="space-y-3">
			{Object.entries(schema).map(([fieldName, typeStr]) => {
				const [type, labelPart] = typeStr.split(":");
				let label = fieldName;
				let unit: string | undefined;
				let options: string[] = [];

				if (labelPart) {
					const match = labelPart.match(/(.+)\s*\((.+)\)/);
					if (match) {
						label = match[1].trim();
						unit = match[2].trim();
					} else {
						label = labelPart;
					}
				}

				// Parse select options
				if (type.startsWith("select")) {
					const optionsMatch = typeStr.match(/select:(.+)/);
					if (optionsMatch) {
						options = optionsMatch[1].split(",").map((o) => o.trim());
					}
				}

				const currentValue = value?.[fieldName] ?? "";

				return (
					<div key={fieldName} className="space-y-1">
						<Label htmlFor={`metadata-${fieldName}`} className="text-xs">
							{label}
							{unit && <span className="text-gray-500 ml-1">({unit})</span>}
						</Label>

						{type === "number" ? (
							<Input
								id={`metadata-${fieldName}`}
								type="number"
								step="any"
								value={currentValue}
								onChange={(e) =>
									handleFieldChange(fieldName, parseFloat(e.target.value) || 0)
								}
								placeholder={`Enter ${label.toLowerCase()}`}
								className="h-9"
							/>
						) : type.startsWith("select") ? (
							<Select
								value={currentValue}
								onValueChange={(val) => handleFieldChange(fieldName, val)}
							>
								<SelectTrigger id={`metadata-${fieldName}`} className="h-9">
									<SelectValue placeholder={`Select ${label.toLowerCase()}`} />
								</SelectTrigger>
								<SelectContent>
									{options.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : (
							<Input
								id={`metadata-${fieldName}`}
								type="text"
								value={currentValue}
								onChange={(e) => handleFieldChange(fieldName, e.target.value)}
								placeholder={`Enter ${label.toLowerCase()}`}
								className="h-9"
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
