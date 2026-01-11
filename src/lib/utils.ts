import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
}

//if the date is 15/02/2026
//and cycleDate is 15
//then the billding period is from JAN 15, 2026 to JAN 15, 2027
// and billing cycle is JAN_2026
export const getBilldingPeriodByDate = (
	date: Date,
	cycleDate: number,
): string => {
	const startDate = new Date(date);
	if (cycleDate == -1) {
		return startDate.getMonth() + "_" + startDate.getFullYear();
	}
	if (cycleDate <= startDate.getDate()) {
		startDate.setMonth(startDate.getMonth() + 1);
		return startDate.getMonth() + "_" + startDate.getFullYear();
	} else {
		return startDate.getMonth() + "_" + startDate.getFullYear();
	}
};
