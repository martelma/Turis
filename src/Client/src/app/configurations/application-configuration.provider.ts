import { EnvironmentProviders, Provider } from '@angular/core';
import { ApplicationConfigurationService } from './application-configuration.service';
import { APPLICATION_CONFIGURATION_TOKEN } from './application-configuration.token';
import { provideConfigurationHttpClient } from './configuration-http-client.provider';

export const provideApplicationConfiguration = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideConfigurationHttpClient(),
        ApplicationConfigurationService,
        {
            provide: APPLICATION_CONFIGURATION_TOKEN,
            useFactory: (configService: ApplicationConfigurationService) => {
                // La configurazione è già pre-caricata in main.ts
                return configService.configData;
            },
            deps: [ApplicationConfigurationService],
        },
    ];
};
