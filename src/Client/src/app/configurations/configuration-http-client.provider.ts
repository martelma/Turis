import { HttpBackend, HttpClient } from '@angular/common/http';
import { EnvironmentProviders, inject, InjectionToken, Provider } from '@angular/core';

export const CONFIGURATION_HTTP_CLIENT_TOKEN = new InjectionToken<HttpClient>('CONFIGURATION_HTTP_CLIENT_TOKEN');

export const provideConfigurationHttpClient = (): Array<Provider | EnvironmentProviders> => {
    return [
        {
            provide: CONFIGURATION_HTTP_CLIENT_TOKEN,
            useFactory: () => {
                // Use HttpBackend directly to bypass interceptors
                const handler = inject(HttpBackend);
                return new HttpClient(handler);
            },
        },
    ];
};
