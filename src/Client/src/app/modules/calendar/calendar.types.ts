import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface CalendarSearchParameters extends BaseSearchParameters {
    pattern?: string;
    selectedLanguageIds?: string;
}
