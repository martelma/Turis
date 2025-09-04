import { InjectionToken } from '@angular/core';
import { Environment } from './environment.types';

export const ENVIRONMENT_TOKEN = new InjectionToken<Environment>('Current environment');
