import { InjectionToken } from '@angular/core';
import { VersionInfo } from './application-version-info.types';

export const APPLICATION_VERSION_INFO_TOKEN = new InjectionToken<VersionInfo>('ApplicationVersionInfo');
