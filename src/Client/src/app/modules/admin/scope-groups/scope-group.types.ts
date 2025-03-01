import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { ApplicationScope } from '../scopes/scope.types';
import { Application } from 'app/shared/services/shared.types';

export interface ApplicationScopeGroup {
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
