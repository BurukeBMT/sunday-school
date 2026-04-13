export interface EthiopianDate {
    year: number;
    month: number;
    day: number;
}

const ETHIOPIAN_MONTH_NAMES = [
    'መስከረም',
    'ጥቅምት',
    'ህዳር',
    'ታህሳስ',
    'ጥር',
    'የካቲት',
    'መጋቢት',
    'ሚያዝያ',
    'ግንቦት',
    'ሰኔ',
    'ሐምሌ',
    'ነሐሴ',
    'ጳጉሜ'
];

function mod(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function gregorianToEthiopian(date: Date): EthiopianDate {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const epoch = 1723856;
    const r = mod(jd - epoch, 1461);
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const ethYear = 4 * Math.floor((jd - epoch) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
    const ethMonth = Math.floor(n / 30) + 1;
    const ethDay = (n % 30) + 1;

    return { year: ethYear, month: ethMonth, day: ethDay };
}

export function formatEthiopianDate(date: Date): string {
    const eth = gregorianToEthiopian(date);
    const monthName = ETHIOPIAN_MONTH_NAMES[eth.month - 1] || `${eth.month}`;
    return `${eth.day} ${monthName} ${eth.year}`;
}
