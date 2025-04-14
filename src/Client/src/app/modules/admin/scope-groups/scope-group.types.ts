import { Application } from 'app/shared/services/shared.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { ApplicationScope } from '../scopes/scope.types';

export interface ApplicationScopeGroup extends BaseSearchParameters {
    id?: string;
    name?: string;
    description?: string;
    applicationId?: string;
    application?: Application;
    scopes?: ApplicationScope[];
}

export interface ApplicationScopeGroupSearchParameters extends BaseSearchParameters {
    pattern?: string;
}

export interface ApplicationScopeSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
