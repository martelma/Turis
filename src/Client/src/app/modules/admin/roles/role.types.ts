import { User } from 'app/core/user/user.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { Scope } from './scopes.types';

export interface ApplicationRole {
    applicationId?: string;
    description?: string;
    id?: string;
    name?: string;
    scopes?: Scope[];
    users?: User[];
}

export interface ApplicationRoleSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
