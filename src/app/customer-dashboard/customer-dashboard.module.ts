import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerDashboardRoutingModule } from './customer-dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
    SideNavigationComponent,
    OrderHistoryComponent
  ],
  imports: [CommonModule, CustomerDashboardRoutingModule, SharedModule]
})
export class CustomerDashboardModule {}
