import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet],
})
export class LanguageComponent {
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
