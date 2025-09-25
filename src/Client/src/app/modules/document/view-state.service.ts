import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ViewStateService {
    private viewListSubject = new BehaviorSubject<boolean>(true);
    public viewList$ = this.viewListSubject.asObservable();

    setViewList(value: boolean): void {
        this.viewListSubject.next(value);
    }

    getViewList(): boolean {
        return this.viewListSubject.value;
    }

    toggleViewList(): void {
        this.viewListSubject.next(!this.viewListSubject.value);
    }
}
