import { HttpBackend, HttpClient } from '@angular/common/http';
import { EnvironmentProviders, inject, InjectionToken, Provider } from '@angular/core';

export const VERSION_INFO_HTTP_CLIENT_TOKEN = new InjectionToken<HttpClient>('VERSION_INFO_HTTP_CLIENT_TOKEN');

export const provideVersionInfoHttpClient = (): Array<Provider | EnvironmentProviders> => {
    return [
        {
            provide: VERSION_INFO_HTTP_CLIENT_TOKEN,
            useFactory: () => {
                // Use HttpBackend directly to bypass interceptors
                const handler = inject(HttpBackend);
                return new HttpClient(handler);
            },
        },
    ];
};
