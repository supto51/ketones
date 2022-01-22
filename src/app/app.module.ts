import { BrowserModule, TransferState } from '@angular/platform-browser';
import { Inject, NgModule, PlatformRef, PLATFORM_ID } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FacebookModule } from 'ngx-facebook';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule,
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

    return pathArr.join(splitOn);
  }
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
    WildcartRoutingModule,
    SharedModule,
    CoreModule,
    SidebarModule,
    FacebookModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      compiler: {
        provide: TranslateCompiler,
        useClass: PhraseAppCompiler,
      },
    }),
  ],
  providers: [{ provide: UrlSerializer, useClass: CustomeUrlSerializer }],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(@Inject(PLATFORM_ID) private platformId: PlatformRef) {
    if (isPlatformBrowser(this.platformId)) {
      import('@lottiefiles/lottie-player');
    }
  }
}
