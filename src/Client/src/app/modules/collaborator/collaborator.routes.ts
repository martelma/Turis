import { Routes } from '@angular/router';
import { FeedbackComponent } from './feedback/feedback.component';

export default [
    {
        path: 'feedback/:id',
        component: FeedbackComponent,
    },
] as Routes;
