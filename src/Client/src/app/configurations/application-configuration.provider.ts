import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApplicationConfigurationService } from './application-configuration.service';
import { APPLICATION_CONFIGURATION_TOKEN } from './application-configuration.token';
import { provideConfigurationHttpClient } from './configuration-http-client.provider';

export const provideApplicationConfiguration = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideConfigurationHttpClient(),
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfig,
            deps: [ApplicationConfigurationService],
            multi: true,
        },
        {
            provide: APPLICATION_CONFIGURATION_TOKEN,
            useFactory: authorizationConfigurationFactory,
            deps: [ApplicationConfigurationService],
        },
    ];
};

export const loadConfig = (configService: ApplicationConfigurationService) => {
    return () => firstValueFrom(configService.loadAppConfig());
};

const authorizationConfigurationFactory = (configService: ApplicationConfigurationService) => {
    return configService.configData;
};
