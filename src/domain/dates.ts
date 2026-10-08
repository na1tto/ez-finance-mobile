export const FINANCIAL_TIME_ZONE = "America/Sao_Paulo";

export function civilToday(now = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: FINANCIAL_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
	}).formatToParts(now);
	const part = (type: string) => parts.find((item) => item.type === type)!.value;
	return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

export function validateCivilDate(value: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Use uma data YYYY-MM-DD.");
	const [year, month, day] = value.split("-").map(Number);
	const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
		throw new Error("Data civil inexistente.");
	}
	return value;
}

export function validateOccurredOn(value: string, today = civilToday()): string {
	validateCivilDate(today);
	validateCivilDate(value);
	if (value > today) throw new Error("Data futura não permitida.");
	return value;
}

export function monthlyPeriod(month: string): { start: string; endExclusive: string | null } {
	if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("Use um mês YYYY-MM.");
	validateCivilDate(`${month}-01`);
	const [year, number] = month.split("-").map(Number);
	// There is no following month within the supported four-digit civil calendar.
	if (month === "9999-12") return { start: `${month}-01`, endExclusive: null };
	const next = number === 12 ? `${String(year + 1).padStart(4, "0")}-01` : `${year.toString().padStart(4, "0")}-${String(number + 1).padStart(2, "0")}`;
	return { start: `${month}-01`, endExclusive: `${next}-01` };
}

export function shiftCivilMonth(month: string, offset: -1 | 1): string | null {
	monthlyPeriod(month);
	const [year, number] = month.split('-').map(Number);
	const index = (year - 1) * 12 + number - 1 + offset;
	if (index < 0 || index >= 9999 * 12) return null;
	return `${String(Math.floor(index / 12) + 1).padStart(4, '0')}-${String(index % 12 + 1).padStart(2, '0')}`;
}

export function formatCivilMonth(month: string): string {
	monthlyPeriod(month);
	// Explicit UTC and full civil date preserve even years 0001–0099.
	return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
		.format(new Date(`${month}-01T12:00:00Z`));
}
