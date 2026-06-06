import {
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { ApiServiceService } from './api-service.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(ApiServiceService);

  const token:string | null = authService?.getToken();
  // APIs that DON'T need token
  const publicApis = [
    '/auth-wallet/get-nonce',
    '/auth-wallet/verify'
  ];

  const isPublicApi = publicApis.some(url =>
    req.url.includes(url)
  );

  // skip token
  if (isPublicApi || !token) {
    return next(req);
  }

  // add token
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedReq);
};