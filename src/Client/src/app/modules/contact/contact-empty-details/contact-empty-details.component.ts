import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-contact-empty-details',
    templateUrl: './contact-empty-details.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatIconModule, TranslocoModule],
})
export class ContactEmptyDetailsComponent {}
