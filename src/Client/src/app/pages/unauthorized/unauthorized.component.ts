import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'unauthorized.component.html',
    imports: [RouterLink, TranslocoModule],
})
export class UnauthorizedComponent {}
