import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { PaymentType, PaymentTypeSearchParameters } from './payment-types.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class PaymentTypeService extends BaseEntityService<PaymentType> {
    private _paymentTypes: BehaviorSubject<PaginatedListResult<PaymentType>> = new BehaviorSubject(null);
    private _paymentType: BehaviorSubject<PaymentType> = new BehaviorSubject(null);
    private _paymentTypesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<PaymentTypeSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'payment-type';
    }

    /**
     * Getter for paymentTypes
     */
    get paymentTypes$(): Observable<PaginatedListResult<PaymentType>> {
        return this._paymentTypes.asObservable();
    }

    /**
     * Getter for paymentType
     */
    get paymentType$(): Observable<PaymentType> {
        return this._paymentType.asObservable();
    }

    /**
     * Getter for paymentTypes loading
     */
    get paymentTypesLoading$(): Observable<boolean> {
        return this._paymentTypesLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<PaymentTypeSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a paymentType identified by the given paymentType id
     */
    getById(id: string): Observable<PaymentType> {
        return this.getSingle(id).pipe(
            map(paymentType => {
                this._paymentType.next(paymentType);

                return paymentType;
            }),
        );
    }

    /**
     * Create a dummy paymentType
     */
    createEntity(): Observable<PaymentType> {
        return this.paymentTypes$.pipe(
            take(1),
            switchMap(paymentTypes =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    note: '',
                    sdiCode: '',
                    sdiName: '',
                }).pipe(
                    map(newPaymentType => {
                        // Update the paymentTypes with the new paymentType
                        this._paymentTypes.next({ ...paymentTypes, items: [newPaymentType, ...paymentTypes.items] });

                        // Return the new paymentType
                        return newPaymentType;
                    }),
                ),
            ),
        );
    }

    /**
     * Update paymentType
     *
     * @param id
     * @param paymentType
     */
    updateEntity(id: string, paymentType: PaymentType): Observable<PaymentType> {
        return this.paymentTypes$.pipe(
            take(1),
            switchMap(paymentTypes =>
                this.create(paymentType).pipe(
                    map(() => {
                        // Find the index of the updated paymentType
                        const index = paymentTypes.items.findIndex(item => item.id === id);

                        // Update the paymentType
                        paymentTypes[index] = paymentType;

                        // Update the paymentType
                        this._paymentType.next(paymentType);

                        // Return the updated paymentType
                        return paymentType;
                    }),
                    switchMap(updatedPaymentType =>
                        this.paymentType$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the paymentType if it's selected
                                this._paymentType.next(updatedPaymentType);

                                // Return the updated paymentType
                                return updatedPaymentType;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all paymentTypes
     * @returns
     */
    listEntities(params?: PaymentTypeSearchParameters): Observable<PaginatedListResult<PaymentType>> {
        this._paymentTypesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<PaymentType>>(url).pipe(
            map((list: PaginatedListResult<PaymentType>) => {
                this._paymentTypes.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._paymentTypesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the paymentType identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<PaymentType> {
        return this._paymentTypes.pipe(
            take(1),
            switchMap(paymentTypes => {
                // Remove the paymentType
                this._paymentType.next(null);

                // Remove the paymentType from the paymentTypes
                this._paymentTypes.next({ ...paymentTypes, items: paymentTypes.items.filter(item => item.id !== id) });

                // Return the paymentType
                return this.delete(id);
            }),
            switchMap(paymentType => {
                if (!paymentType) {
                    return throwError('Could not found paymentType with id of ' + id + '!');
                }

                return of(paymentType);
            }),
        );
    }
}
