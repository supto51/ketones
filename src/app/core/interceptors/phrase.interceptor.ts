import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppApiService } from 'src/app/shared/services/app-api.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PhraseInterceptor implements HttpInterceptor {
  constructor(
    private dataService: AppDataService,
    private apiService: AppApiService,
    private translate: TranslateService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const headers = {
      Authorization: environment.phraseAppToken
    };
    const modifiedRequest = request.clone({
      headers: new HttpHeaders(headers)
    });
    if (request.url.includes(environment.phraseBase)) {
      return next.handle(modifiedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          this.setStaticTranslation();

          return throwError(error);
        })
      );
    }
    return next.handle(request);
  }

  setStaticTranslation() {
    this.dataService.currentSelectedLanguage.subscribe((language: string) => {
      this.apiService
        .getStaticTranslation(language)
        .subscribe((translations: any) => {
          this.translate.setTranslation(language, translations);
        });
    });
  }
}
