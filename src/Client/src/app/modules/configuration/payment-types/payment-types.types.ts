import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface PaymentType {
    id: string;
    code: string;
    name: string;
    note: string;
    sdiCode: string;
    sdiName: string;
}

export interface PaymentTypeSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
