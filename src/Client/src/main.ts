import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// Needed for the DatePipe
registerLocaleData(localeIt, 'it');

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err))
    .then(() => {
        console.log('Applicazione avviata con successo.');
    })
    .catch(err => {
        console.error("Errore durante l'avvio:", err);
    });
