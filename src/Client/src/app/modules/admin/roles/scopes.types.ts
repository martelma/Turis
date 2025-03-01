import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface Scope {
    id?: string;
    name?: string;
    description?: string;
    roleIds?: string[];
    scopeGroup?: ScopeGroup;
}

export interface ScopeGroup {
    id?: string;
    name?: string;
    description?: string;
    scopes?: Scope[];
}

export interface ApplicationScopesSearchParameters extends BaseSearchParameters {
    pattern?: string;
}

export interface ApplicationScopeGroupsSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
