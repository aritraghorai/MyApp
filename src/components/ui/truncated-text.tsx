import { cn } from "@/lib/utils";

interface TruncatedTextProps {
	children: React.ReactNode;
	className?: string;
}

export function TruncatedText({ children, className }: TruncatedTextProps) {
	return (
		<p
			className={cn(
				"font-medium text-sm truncate flex-shrink min-w-0 text-wrap",
				className,
			)}
		>
			{children}
		</p>
	);
}
