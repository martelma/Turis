import { APP_INITIALIZER, EnvironmentProviders, Provider } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApplicationVersionInfoService } from './application-version-info.service';
import { APPLICATION_VERSION_INFO_TOKEN } from './application-version-info.token';
import { provideVersionInfoHttpClient } from './version-info-http-client.provider';

export const provideApplicationVersionInfo = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideVersionInfoHttpClient(),
        {
            provide: APP_INITIALIZER,
            useFactory: loadVersion,
            deps: [ApplicationVersionInfoService],
            multi: true,
        },
        {
            provide: APPLICATION_VERSION_INFO_TOKEN,
            useFactory: authorizationVersionInfoFactory,
            deps: [ApplicationVersionInfoService],
        },
    ];
};

export const loadVersion = (versionService: ApplicationVersionInfoService) => {
    return () => firstValueFrom(versionService.loadAppVersion());
};

const authorizationVersionInfoFactory = (configService: ApplicationVersionInfoService) => {
    return configService.versionInfoData;
};
