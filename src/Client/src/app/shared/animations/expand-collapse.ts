import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';

export const expandCollapse = trigger('expandCollapse', [
    state('true', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
    state('false', style({ height: '0', visibility: 'hidden' })),
    transition('false => true', animate('200ms ease-in')),
    transition('true => false', animate('200ms ease-out')),
]);
