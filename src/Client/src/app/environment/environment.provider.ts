import { Provider, inject } from '@angular/core';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ENVIRONMENT_TOKEN } from './environment.token';
import { Environment } from './environment.types';

export const provideEnvironment = (): Provider => {
    return {
        provide: ENVIRONMENT_TOKEN,
        useFactory: () => {
            const applicationConfiguration = inject(APPLICATION_CONFIGURATION_TOKEN);
            if (applicationConfiguration.production) {
                return Environment.PRODUCTION;
            }
            if (applicationConfiguration.staging) {
                return Environment.STAGING;
            }
            return Environment.DEV;
        },
    };
};
