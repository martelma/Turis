import { InjectionToken } from '@angular/core';
import { ApplicationConfiguration } from './application-configuration.types';

export const APPLICATION_CONFIGURATION_TOKEN = new InjectionToken<ApplicationConfiguration>('ApplicationConfiguration');
