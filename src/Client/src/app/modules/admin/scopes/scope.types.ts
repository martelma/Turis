import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class ApplicationScope {
    id?: string;
    name?: string;
    description?: string;
    applicationId?: string;
    scopeGroupId?: string;
    scopeGroupName?: string;
    roleIds?: string[];
}

export interface ScopeSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
