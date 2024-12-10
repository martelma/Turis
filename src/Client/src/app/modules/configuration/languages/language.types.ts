import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface Language {
    id: string;
    code: string;
    name: string;
    codeIso: string;
}

export interface LanguageSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
