import { environment } from 'environments/environment';

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

export const isProductionMode = environment.production;
export const isStagingMode = environment.staging;
export const isDevMode = environment.dev;
