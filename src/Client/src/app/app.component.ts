import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APPLICATION_CONFIGURATION_TOKEN } from './configurations/application-configuration.token';
import { ApplicationConfiguration } from './configurations/application-configuration.types';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
    favIcon: HTMLLinkElement | null = document.querySelector('#appFavIcon');

    constructor(@Inject(APPLICATION_CONFIGURATION_TOKEN) private _applicationConfig: ApplicationConfiguration) {}

    ngOnInit(): void {
        if (this._applicationConfig.staging) {
            this._updateFavicon('./assets/images/favicon-staging.png');
        }
        if (this._applicationConfig.dev) {
            this._updateFavicon('./assets/images/favicon-dev.png');
        }
    }

    private _updateFavicon(iconUrl: string): void {
        // Remove the old favicon
        if (this.favIcon) {
            this.favIcon.parentNode?.removeChild(this.favIcon);
        }

        // Create a new favicon link element with a cache-busting query parameter
        const newFavIcon = document.createElement('link');
        newFavIcon.rel = 'icon';
        newFavIcon.type = 'image/x-icon';
        newFavIcon.href = `${iconUrl}?v=${new Date().getTime()}`;
        newFavIcon.id = 'appFavIcon';

        // Append the new favicon to the document head
        document.head.appendChild(newFavIcon);
    }
}
