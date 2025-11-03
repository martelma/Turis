import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Payment, PaymentSearchParameters } from '../payment/payment.types';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class PaymentService extends BaseEntityService<Payment> {
    private _edited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _list: BehaviorSubject<PaginatedListResult<Payment>> = new BehaviorSubject(null);
    private _item: BehaviorSubject<Payment> = new BehaviorSubject(null);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _parameters: BehaviorSubject<PaymentSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });

    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'payment';
    }

    get list$(): Observable<PaginatedListResult<Payment>> {
        return this._list.asObservable();
    }

    get item$(): Observable<Payment> {
        return this._item.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get edited$(): Observable<string> {
        return this._edited.asObservable();
    }

    get parameters$(): Observable<PaymentSearchParameters> {
        return this._parameters.asObservable();
    }

    getById(id: string): Observable<Payment> {
        return this.getSingle(id).pipe(
            map(payment => {
                this._item.next(payment);

                return payment;
            }),
        );
    }

    createEntity(): Observable<Payment> {
        const item: Payment = {
            id: emptyGuid,
            items: [],
            collaboratorId: '',
            collaborator: null,
            vatRate: 0,
            vat: 0,
            withholdingTaxRate: 0,
            withholdingTax: 0,
            amount: 0,
            total: 0,
            note: '',
            bookmarkId: '',
            selected: false,
            date: undefined,
            number: '',
        };

        this._item.next(item);

        return of(item);
    }

    updateEntity(id: string, payment: Payment): Observable<Payment> {
        return this.list$.pipe(
            take(1),
            switchMap(payments =>
                this.create(payment).pipe(
                    map(() => {
                        // Find the index of the updated payment
                        const index = payments.items.findIndex(item => item.id === id);

                        // Update the payment
                        payments[index] = payment;

                        // Update the payment
                        this._item.next(payment);

                        // Return the updated payment
                        return payment;
                    }),
                    switchMap(updatedPayment =>
                        this.item$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the payment if it's selected
                                this._item.next(updatedPayment);

                                // Return the updated payment
                                return updatedPayment;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    listEntities(params?: PaymentSearchParameters): Observable<PaginatedListResult<Payment>> {
        this._loading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Payment>>(url).pipe(
            map((list: PaginatedListResult<Payment>) => {
                this._list.next(list);

                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    deleteEntity(id: string): Observable<Payment> {
        return this._list.pipe(
            take(1),
            switchMap(payments => {
                // Remove the payment
                this._item.next(null);

                // Remove the payment from the _payments
                this._list.next({ ...payments, items: payments.items.filter(item => item.id !== id) });

                // Return the payment
                return this.delete(id);
            }),
            switchMap(payment => {
                if (!payment) {
                    return throwError('Could not found payment with id of ' + id + '!');
                }

                return of(payment);
            }),
        );
    }

    editEntity(id: string): void {
        this._edited.next(id);
    }
}
