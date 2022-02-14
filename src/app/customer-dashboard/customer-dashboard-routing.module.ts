import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AutoLoginGuard } from 'angular-auth-oidc-client';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { AutoLoginGuard } from 'angular-auth-oidc-client';
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'dashboard/order-history',
    component: OrderHistoryComponent,
    canActivate: [AutoLoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerDashboardRoutingModule {}
