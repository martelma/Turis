import { Observable, Subject } from 'rxjs';
import { ErrorModalCommand } from '../shared/types/error-modal.types';

export class BaseCommands {
    private static _instance: BaseCommands;

    private _onShowModalError: Subject<ErrorModalCommand> = new Subject();

    public static get instance(): BaseCommands {
        return this._instance || (this._instance = new this());
    }

    get onShowModalError(): Observable<any> {
        return this._onShowModalError.asObservable();
    }

    public showModalError(errorModal: ErrorModalCommand): void {
        this._onShowModalError.next(errorModal);
    }
}
