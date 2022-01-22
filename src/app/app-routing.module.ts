import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingRedirectModule } from './shipping-redirect/shipping-redirect.module';
import { TermsRedirectModule } from './terms-redirect/terms-redirect.module';
import { PrivacyRedirectModule } from './privacy-redirect/privacy-redirect.module';
import { RefundRedirectModule } from './refund-redirect/refund-redirect.module';
import { ProceduresRedirectModule } from './procedures-redirect/procedures-redirect.module';
import { BlogsModule } from './blogs/blogs.module';
import { IncomeRedirectModule } from './income-redirect/income-redirect.module';
import { ResearchModule } from './research/research.module';
import { IngredientModule } from './ingredients/ingredient.module';
import { FoodsModule } from './foods/foods.module';

const routes: Routes = [
  {
    path: 'food',
    loadChildren: () => FoodsModule,
  },
  {
    path: 'research',
    loadChildren: () => ResearchModule,
  },
  {
    path: 'ca/research',
    loadChildren: () => ResearchModule,
  },

  {
    path: 'blog',
    loadChildren: () => BlogsModule,
  },
  {
    path: 'ca/blog',
    loadChildren: () => BlogsModule,
  },

  {
    path: 'ingredients',
    loadChildren: () => IngredientModule,
  },
  {
    path: ':id/ingredients',
    loadChildren: () => IngredientModule,
  },

  {
    path: 'shipping',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: ':id/shipping',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: 'shipping-policy',
    loadChildren: () => ShippingRedirectModule,
  },
  {
    path: ':id/shipping-policy',
    loadChildren: () => ShippingRedirectModule,
  },

  {
    path: 'terms',
    loadChildren: () => TermsRedirectModule,
  },
  {
    path: ':id/terms',
    loadChildren: () => TermsRedirectModule,
  },

  {
    path: 'privacy',
    loadChildren: () => PrivacyRedirectModule,
  },
  {
    path: ':id/privacy',
    loadChildren: () => PrivacyRedirectModule,
  },

  {
    path: 'refund',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: ':id/refund',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: 'refunds',
    loadChildren: () => RefundRedirectModule,
  },
  {
    path: ':id/refunds',
    loadChildren: () => RefundRedirectModule,
  },

  {
    path: 'policies',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: ':id/policies',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: 'policies-and-procedures',
    loadChildren: () => ProceduresRedirectModule,
  },
  {
    path: ':id/policies-and-procedures',
    loadChildren: () => ProceduresRedirectModule,
  },

  {
    path: 'income-disclaimer',
    loadChildren: () => IncomeRedirectModule,
  },
  {
    path: ':id/income-disclaimer',
    loadChildren: () => IncomeRedirectModule,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
