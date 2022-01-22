import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from '../shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorResponseInterceptor } from './interceptors/error-response.interceptor';
import { ProductsDataService } from '../products/services/products-data.service';
import { ProductsUtilityService } from '../products/services/products-utility.service';
import { SidebarDataService } from '../sidebar/services/sidebar-data.service';
import { BlogInterceptor } from '../blogs/intereptors/blog.interceptor';
import { PhraseInterceptor } from './interceptors/phrase.interceptor';
import { SidebarApiService } from '../sidebar/services/sidebar-api.service';
import { ProductsApiService } from '../products/services/products-api.service';
import { FoodUtilityService } from '../foods/services/food-utility.service';
import { FoodApiService } from '../foods/services/food-api.service';

@NgModule({
  declarations: [HeaderComponent, FooterComponent],
  imports: [SharedModule],
  exports: [HeaderComponent, FooterComponent],
  providers: [
    ProductsApiService,
    ProductsDataService,
    ProductsUtilityService,
    SidebarApiService,
    SidebarDataService,
    FoodUtilityService,
    FoodApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorResponseInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: BlogInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: PhraseInterceptor, multi: true },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
