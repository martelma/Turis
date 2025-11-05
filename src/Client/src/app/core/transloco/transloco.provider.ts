import { APP_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { getBrowserLang, provideTransloco as provideTranslocoCore, TranslocoService } from '@jsverse/transloco';
import { TranslocoHttpLoader } from 'app/core/transloco/transloco.http-loader';

export const provideTransloco = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideTranslocoCore({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                    {
                        id: 'it',
                        label: 'Italiano',
                    },
                    {
                        id: 'es',
                        label: 'Español',
                    },
                    {
                        id: 'fr',
                        label: 'Français',
                    },
                    {
                        id: 'de',
                        label: 'Deutsch',
                    },
                ],
                defaultLang: getBrowserLang() ?? 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            // Preload the default language before the app starts to prevent empty/jumping content
            provide: APP_INITIALIZER,
            useFactory: () => {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);

                return () => translocoService.load(defaultLang).toPromise();
            },
            multi: true,
        },
    ];
};
