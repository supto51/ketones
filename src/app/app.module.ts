import { BrowserModule, TransferState } from '@angular/platform-browser';
import {
  Inject,
  NgModule,
  APP_INITIALIZER,
  PlatformRef,
  PLATFORM_ID
} from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FacebookModule } from 'ngx-facebook';
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';
import { ImplicitModule } from './implicit/implicit.module';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { ProductsModule } from './products/products.module';
import { from, Observable } from 'rxjs';
import { WildcartRoutingModule } from './app-wildcart-routing.module';
import { PhraseAppCompiler } from 'ngx-translate-phraseapp';
import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import * as fromApps from './store/app.reducer';
import { isPlatformBrowser } from '@angular/common';
import { TranslateBrowserLoaderService } from './shared/services/translate-browser-loader.service';
import { environment } from 'src/environments/environment';
import {
  AuthModule,
  OidcConfigService,
  OidcSecurityService
} from 'angular-auth-oidc-client';
export function translateBrowserLoaderFactory(
  httpClient: HttpClient,
  transferState: TransferState
) {
  return new TranslateBrowserLoaderService(transferState, httpClient);
}

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(import(`src/assets/i18n/${lang}.json`));
  }
}

export class CustomeUrlSerializer implements UrlSerializer {
  parse(url: string): UrlTree {
    const urlParts = url.split('?');
    const finalLink = urlParts
      .map((urlPart, index: number) =>
        index == 0 ? urlPart.toLowerCase() : urlPart
      )
      .join('?');
    let dus = new DefaultUrlSerializer();
    return dus.parse(finalLink);
  }

  serialize(tree: UrlTree): any {
    let dus = new DefaultUrlSerializer();
    const path = dus.serialize(tree);

    const splitOn = path.indexOf('?') > -1 ? '?' : '#';
    const pathArr = path.split(splitOn);
    pathArr[0] += '/';

    if (pathArr[0] === '//') {
      pathArr[0] = '/';
    }
    if (pathArr[0].includes('/')) {
      pathArr[0] = pathArr[0].slice(0, -1);
    }

    return pathArr.join(splitOn);
  }
}

export function configureAuth(oidcConfigService: OidcConfigService) {
  return () =>
    oidcConfigService.withConfig({
      stsServer: environment.iaaConfig.stsServer,
      redirectUrl: environment.iaaConfig.redirectUrl,
      // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
      // identified by the iss (issuer) Claim as an audience.
      // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
      // or if it contains additional audiences not trusted by the Client.
      clientId: environment.iaaConfig.clientId,
      customTokenParams: {
        client_secret: environment.iaaConfig.client_secret
      },
      customParamsRefreshToken: {
        client_secret: environment.iaaConfig.client_secret
      },
      responseType: environment.iaaConfig.responseType,
      scope: environment.iaaConfig.scope,
      postLogoutRedirectUri: environment.iaaConfig.postLogoutRedirectUri,
      startCheckSession: environment.iaaConfig.startCheckSession,
      silentRenew: environment.iaaConfig.silentRenew,
      silentRenewUrl: environment.iaaConfig.silentRenewUrl,
      postLoginRoute: environment.iaaConfig.postLoginRoute,
      // HTTP 403
      forbiddenRoute: environment.iaaConfig.forbiddenRoute,
      useRefreshToken: true,
      // HTTP 401
      unauthorizedRoute: environment.iaaConfig.unauthorizedRoute,
      // log_console_warning_active: true,
      // log_console_debug_active: true,
      // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
      // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
      maxIdTokenIatOffsetAllowedInSeconds:
        environment.iaaConfig.maxIdTokenIatOffsetAllowedInSeconds,
      triggerAuthorizationResultEvent:
        environment.iaaConfig.triggerAuthorizationResultEvent
    });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(fromApps.appReducer),
    AppRoutingModule,
    ProductsModule,
    ImplicitModule,
    CustomerDashboardModule,
    WildcartRoutingModule,
    SharedModule,
    CoreModule,
    SidebarModule,
    FacebookModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      compiler: {
        provide: TranslateCompiler,
        useClass: PhraseAppCompiler
      }
    }),
    AuthModule.forRoot()
  ],
  providers: [
    OidcConfigService,
    OidcSecurityService,

    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService],
      multi: true
    },
    { provide: UrlSerializer, useClass: CustomeUrlSerializer }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(@Inject(PLATFORM_ID) private platformId: PlatformRef) {
    if (isPlatformBrowser(this.platformId)) {
      import('@lottiefiles/lottie-player');
    }
  }
}
