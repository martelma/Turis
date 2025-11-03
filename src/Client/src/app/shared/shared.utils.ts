export const goToLink = (relativeUrl: string, newTab = false) => {
    if (newTab) {
        window.open(relativeUrl, '_blank');
    } else {
        window.open(relativeUrl, '_self');
    }
};

export const trackByFn = (index: number, item: any): any => {
    return item.id || index;
};

export const compareFn = (o1: any, o2: any) => o1.id === o2.id;

export const toUtcString = (date: Date): string => {
    if (date === null || date === undefined) {
        return '';
    }

    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');
};

export const equals = (a1, a2, prop = 'name') => {
    if (a1 == null || a2 == null) return false;

    return a1.length === a2.length && a1.every(x1 => a2.some(x2 => x1[prop] === x2[prop]));
};

export const log = (item: any): void => {
    console.log(item);
};

export const removeDuplicates = (data: any[]): any[] => {
    return data?.filter((value, index) => data?.indexOf(value) === index) ?? [];
};

export const intersect = (array1: any[], array2: any[]): any[] => {
    return array1?.filter(n => array2?.indexOf(n) !== -1) ?? [];
};

export const capitalize = (string: string): string => {
    return string[0].toUpperCase() + string.slice(1);
};

export const pad = (num: number, size: number): string => {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
};

/**
 * Genera un nuovo GUID (UUID v4)
 */
export function generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function years(number: number): number[] {
    const nextYear = new Date().getFullYear() + 1;
    const startYear = nextYear - number;
    const years: number[] = [];

    for (let i = 0; i < 5; i++) {
        years.push(startYear + i);
    }
    return years;
}
// Versione che restituisce Date objects
export const getMonthDateRange = (date: Date): { dateFrom: Date; dateTo: Date } => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const dateFrom = new Date(year, month, 1);
    const dateTo = new Date(year, month + 1, 0);

    return { dateFrom, dateTo };
};

// Versione che restituisce ISO strings (quella originale)
export const getMonthBoundaries = (date: Date): { dateFrom: string; dateTo: string } => {
    const { dateFrom, dateTo } = getMonthDateRange(date);
    return {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
    };
};

export function getFirstDayOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getLastDayOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
