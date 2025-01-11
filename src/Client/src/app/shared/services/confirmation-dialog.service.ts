import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
    showSuccessMessage(options: SweetAlertOptions) {
        return this.showMessage({ ...options, icon: 'success' });
    }

    showErrorMessage(options: SweetAlertOptions) {
        return this.showMessage({ ...options, icon: 'error' });
    }

    showWarningMessage(options: SweetAlertOptions) {
        return this.showMessage({ ...options, icon: 'warning' });
    }

    showInfoMessage(options: SweetAlertOptions) {
        return this.showMessage({ ...options, icon: 'info' });
    }

    showQuestionMessage(options: SweetAlertOptions) {
        return this.showMessage({ ...options, icon: 'question' });
    }

    private showMessage(options: SweetAlertOptions) {
        return Swal.fire(options);
    }
}
