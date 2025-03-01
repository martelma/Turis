import { User } from 'app/core/user/user.types';
import { Scope } from './scopes.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';

export interface ApplicationRole {
    applicationId?: string;
    description?: string;
    id?: string;
    name?: string;
    scopes?: Scope[];
    users?: User[];
}

export interface RoleSearchParameters extends BaseSearchParameters {
    pattern?: string;
}
