import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HomeComponent } from './components/products-home/home.component';
import { PagesComponent } from './components/pages/pages.component';
import { ModalCheckoutComponent } from './components/modals/modal-checkout/modal-checkout.component';
import { ModalProductsComponent } from './components/modals/modal-products/modal-products.component';
import { TagsAndCategoriesComponent } from './components/tags-and-categories/tags-and-categories.component';
import { ModalUtilitiesComponent } from './components/modals/modal-utilities/modal-utilities.component';
import { SearchComponent } from './components/search/search.component';
import { BannerSliderComponent } from './components/products-home/banner-slider/banner-slider.component';
import { TagsListComponent } from './components/products-home/tags-list/tags-list.component';
import { CategoriesListComponent } from './components/products-home/categories-list/categories-list.component';
import { FormComponent } from './components/product-details/form/form.component';
import { InfoComponent } from './components/product-details/info/info.component';
import { ProductDetailComponent } from './components/product-details/details.component';
import { CategorySearchPipe } from './pipes/category-search.pipe';
import { SharedModule } from '../shared/shared.module';
import { ClipboardModule } from 'ngx-clipboard';
import { ProductsRoutingModule } from './products-routing.module';
import { SmartshipComponent } from './components/smartship/smartship.component';
import { TranslationInjectPipe } from './pipes/translation-inject.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { PromoterComponent } from './components/promoter/promoter.component';
import { BrandBuilderComponent } from './components/promoter/brand-builder/brand-builder.component';
import { SmartshipProductsComponent } from './components/smartship/smartship-products/smartship-products.component';
import { SmartshipAboutComponent } from './components/smartship/smartship-about/smartship-about.component';
import { ProductCardComponent } from './components/common/product-card/product-card.component';
import { TrendingComponent } from './components/products-home/trending/trending.component';

@NgModule({
  declarations: [
    HomeComponent,
    PagesComponent,
    ModalCheckoutComponent,
    ModalProductsComponent,
    TagsAndCategoriesComponent,
    ModalUtilitiesComponent,
    SearchComponent,
    CategorySearchPipe,
    BannerSliderComponent,
    TagsListComponent,
    CategoriesListComponent,
    FormComponent,
    InfoComponent,
    ProductDetailComponent,
    SmartshipComponent,
    TranslationInjectPipe,
    SortPipe,
    PromoterComponent,
    BrandBuilderComponent,
    SmartshipProductsComponent,
    SmartshipAboutComponent,
    ProductCardComponent,
    TrendingComponent,
  ],
  imports: [SharedModule, ClipboardModule, ProductsRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsModule {}
