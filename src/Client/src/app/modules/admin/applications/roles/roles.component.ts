import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    standalone: true,
    imports: [RouterOutlet],
})
export class ApplicationRolesComponent {
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }
}
