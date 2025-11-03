import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

// Needed for the DatePipe
registerLocaleData(localeIt, 'it');

// Pre-carica la configurazione prima del bootstrap
async function loadConfiguration() {
    try {
        // Tenta di caricare application-config.local.json prima
        const response = await fetch('application-config.local.json');
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Local config not found');
    } catch {
        // Se fallisce, carica application-config.json
        const response = await fetch('application-config.json');
        if (!response.ok) {
            throw new Error('Configuration file not found');
        }
        return await response.json();
    }
}

// Carica la configurazione e poi avvia Angular
loadConfiguration()
    .then(config => {
        console.log('Configuration loaded:', config);
        // Salva la configurazione in una variabile globale temporanea
        (window as any).__APP_CONFIG__ = config;

        // Ora avvia Angular
        return bootstrapApplication(AppComponent, appConfig);
    })
    .then(() => {
        console.log('Applicazione avviata con successo.');
    })
    .catch(err => {
        console.error("Errore durante l'avvio:", err);
    });
