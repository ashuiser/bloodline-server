export function isBloodCompatible(donorType: string, requiredType: string): boolean {
	const compatibility: Record<string, string[]> = {
		"A+": ["A+", "A-", "O+", "O-"],
		"A-": ["A-", "O-"],
		"B+": ["B+", "B-", "O+", "O-"],
		"B-": ["B-", "O-"],
		"AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
		"AB-": ["A-", "B-", "AB-", "O-"],
		"O+": ["O+", "O-"],
		"O-": ["O-"],
	};

	return compatibility[requiredType]?.includes(donorType) || false;
}
