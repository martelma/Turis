import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-document-empty-details',
    templateUrl: './document-empty-details.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatIconModule, TranslocoModule],
})
export class DocumentEmptyDetailsComponent {}
