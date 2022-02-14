import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NgInterceptorService implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private oidcSecurityService: OidcSecurityService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let requestToForward = req;

    // const localUser = localStorage.getItem('MVUser');
    // const user = localUser ? JSON.parse(localUser)
    if (req.url.includes(environment.phraseBase)) {
      return next.handle(requestToForward);
    }
    if (this.oidcSecurityService === undefined) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    // if (user !== null) {
    //   let token = user.access_token;
    //   if (token !== '') {
    //     let tokenValue = 'Bearer ' + token;
    //     requestToForward = req.clone({
    //       setHeaders: { Authorization: tokenValue }
    //     });
    //   }
    // } else {
    //   console.debug('No auth header');
    // }
    if (this.oidcSecurityService !== undefined) {
      let token = this.oidcSecurityService.getToken();
      if (token !== '') {
        let tokenValue = 'Bearer ' + token;
        requestToForward = req.clone({
          setHeaders: { Authorization: tokenValue }
        });
      }
    } else {
      console.debug('OidcSecurityService undefined: NO auth header');
    }
    return next.handle(requestToForward);
  }
}
