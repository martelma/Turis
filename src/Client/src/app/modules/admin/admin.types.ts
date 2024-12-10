import { HttpHeaders } from '@angular/common/http';

/**
 * Header to be used when targetting shielded api endpoints with Administrator Role
 * assigned to the Workspace application.
 */
export const XApplicationIdHeader:
    | HttpHeaders
    | {
          [header: string]: string | string[];
      } = {
    'X-Application-Id': '70B35A7C-BB04-41FE-AB76-AA99B20D30B0',
};
