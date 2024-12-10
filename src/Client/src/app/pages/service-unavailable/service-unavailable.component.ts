import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'service-unavailable',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'service-unavailable.component.html',
    imports: [TranslocoModule],
})
export class ServiceUnavailableComponent {}
