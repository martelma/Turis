export interface ApplicationConfiguration {
    applicationId: string;
    production: boolean;
    staging: boolean;
    dev: boolean;
    baseUrl: string;
    appUrl: string;
    signalrHubUrl: string;
}
