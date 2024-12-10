import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-back-button',
    templateUrl: './back-button.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatIconModule, MatButtonModule, TranslocoModule],
})
export class BackButtonComponent {
    constructor(private _location: Location) {}

    goBack(): void {
        this._location.back();
    }
}
