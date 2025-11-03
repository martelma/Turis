export type ReleaseType = 'stable' | 'release-candidate' | 'beta' | 'alpha';
export type ReleaseStatus = 'pending-approval' | 'approved' | 'rejected' | 'deployed';
export type ChangelogType = 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'security';

export interface ChangelogEntry {
    type: ChangelogType;
    description: string;
    issueId?: string;
    author?: string;
}

export interface Approver {
    userId: string;
    name: string;
    email: string;
    approvedAt: string;
    decision: 'approved' | 'rejected';
    comment?: string;
}

export interface ReleaseMetadata {
    previousVersion: string;
    branch: string;
    commit: string;
    author: string;
    approvers: Approver[];
    deployedAt?: string;
    deployedBy?: string;
}

export interface VersionInfo {
    version: string;
    releaseDate: string;
    buildDate: string;
    buildNumber: string;
    releaseName: string;
    releaseType: ReleaseType;
    status: ReleaseStatus;
    approvalRequired: boolean;
    environment: 'development' | 'staging' | 'production';
    changelog: ChangelogEntry[];
    metadata: ReleaseMetadata;
}
