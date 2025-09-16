import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface AliquotaIva {
    id: string;
    code: string;
    name: string;
    description: string;
    aliquota: number;
    codiceNatura: string;
}

export interface AliquotaIvaSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
