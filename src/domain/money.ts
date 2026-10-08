export const MAX_AMOUNT_CENTS = 99_999_999;

export function validateAmountCents(value: number): number {
	if (!Number.isSafeInteger(value) || value < 1 || value > MAX_AMOUNT_CENTS) {
		throw new RangeError("Valor deve ser inteiro entre 1 e 99.999.999 centavos.");
	}
	return value;
}

export function parseAmountCents(text: string): number {
	const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(text.trim());
	if (!match) throw new Error("Valor monetário inválido.");
	const cents = BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
	if (cents < 1n || cents > BigInt(MAX_AMOUNT_CENTS)) throw new RangeError("Valor fora do limite.");
	return Number(cents);
}

export function safeSumCents(values: readonly number[]): number {
	let total = 0;
	for (const value of values) {
		if (!Number.isSafeInteger(value) || !Number.isSafeInteger(total + value)) {
			throw new RangeError("Total excede a precisão segura de centavos.");
		}
		total += value;
	}
	return total;
}

// Format integer digits directly, including totals and negative balances.
export function formatBRL(cents: number): string {
	if (!Number.isSafeInteger(cents)) throw new RangeError("Centavos sem precisão segura.");
	const digits = BigInt(Math.abs(cents));
	const reais = (digits / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	return `${cents < 0 ? "-" : ""}R$\u00a0${reais},${(digits % 100n).toString().padStart(2, "0")}`;
}
