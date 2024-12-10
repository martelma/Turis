import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class PriceList {
    id: string;
    code: string;
    name: string;
    serviceType: string;
    durationType: string;
    maxCount: number;
    price: number;
    priceExtra: number;

    // constructor() {}
}

export interface PriceListSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
