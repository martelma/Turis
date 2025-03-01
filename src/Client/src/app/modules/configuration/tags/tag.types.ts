import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface Tag {
    id: string;
    name: string;
    description: string;
    color: string;
}

export interface TagSearchParameters extends BaseSearchParameters {
    pattern?: string;
}

export const getContrastYIQ = hexcolor => {
    if (!hexcolor) return 'black';

    const r = parseInt(hexcolor.substring(1, 3), 16);
    const g = parseInt(hexcolor.substring(3, 5), 16);
    const b = parseInt(hexcolor.substring(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
};
