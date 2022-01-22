import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailComponent } from './components/product-details/details.component';
import { HomeComponent } from './components/products-home/home.component';
import { PagesComponent } from './components/pages/pages.component';
import { SearchComponent } from './components/search/search.component';
import { SmartshipComponent } from './components/smartship/smartship.component';
import { TagsAndCategoriesComponent } from './components/tags-and-categories/tags-and-categories.component';
import { PromoterComponent } from './components/promoter/promoter.component';
import { BrandBuilderComponent } from './components/promoter/brand-builder/brand-builder.component';
import { SmartshipAboutComponent } from './components/smartship/smartship-about/smartship-about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: ':id/search', component: SearchComponent },
  {
    path: 'category/keto-os-pro',
    redirectTo: 'category/ketoos-pro',
    pathMatch: 'full',
  },
  {
    path: ':id/category/keto-os-pro',
    redirectTo: ':id/category/ketoos-pro',
    pathMatch: 'full',
  },
  { path: 'category/:id', component: TagsAndCategoriesComponent },
  { path: ':id/category/:id', component: TagsAndCategoriesComponent },
  { path: 'tag/:id', component: TagsAndCategoriesComponent },
  { path: ':id/tag/:id', component: TagsAndCategoriesComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: ':id/product/:id', component: ProductDetailComponent },
  { path: 'page/:id', component: PagesComponent },
  { path: ':id/page/:id', component: PagesComponent },
  { path: 'smartship', component: SmartshipComponent },
  { path: ':id/smartship', component: SmartshipComponent },
  { path: 'smartship/about', component: SmartshipAboutComponent },
  { path: ':id/smartship/about', component: SmartshipAboutComponent },
  { path: 'promoter', component: PromoterComponent },
  { path: ':id/promoter', component: PromoterComponent },
  { path: 'promoter/:id', component: BrandBuilderComponent },
  { path: ':id/promoter/:id', component: BrandBuilderComponent },
  {
    path: 'systems',
    redirectTo: 'category/systems',
    pathMatch: 'full',
  },
  {
    path: ':id/systems',
    redirectTo: ':id/category/systems',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
