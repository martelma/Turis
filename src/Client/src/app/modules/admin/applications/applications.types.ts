import { User } from 'app/core/user/user.types';

export interface Application {
    description?: string;
    icon?: string;
    id?: string;
    name?: string;
    roles?: ApplicationRole[];
    scopes?: ApplicationScope[];
    scopeGroups?: ApplicationScopeGroup[];
    url?: string;
    users?: User[];
}

export interface ApplicationRole {
    description?: string;
    id?: string;
    name?: string;
    scopes?: ApplicationScope[];
    users?: User[];
}

export interface ApplicationScope {
    applicationId?: string;
    id?: string;
    name?: string;
    description?: string;
    roleIds?: string[];
    scopeGroupId?: string;
    scopeGroupName?: string;
}

export interface ApplicationScopeGroup {
    id?: string;
    name?: string;
    description?: string;
    scopes?: ApplicationScope[];
}
