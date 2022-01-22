import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { FoodDelivery } from 'src/app/foods/models/food-delivery.model';
import { SetFoodDeliveryActon } from 'src/app/foods/store/foods-list.actions';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppState } from 'src/app/store/app.reducer';
declare var $: any;

@Component({
  selector: 'app-modal-purchase-warning',
  templateUrl: './modal-purchase-warning.component.html',
  styleUrls: ['./modal-purchase-warning.component.css'],
})
export class ModalPurchaseWarningComponent implements OnInit, OnDestroy {
  foodDelivery = {
    totalItems: 0,
    totalPrice: 0,
    appliedDiscount: 0,
  } as FoodDelivery;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private sidebarDataService: SidebarDataService,
    private dataService: AppDataService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getFoods();
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        if (
          !(
            res.foodDelivery &&
            Object.keys(res.foodDelivery).length === 0 &&
            res.foodDelivery.constructor === Object
          )
        ) {
          const tempDelivery = Object.assign({}, res.foodDelivery);

          this.foodDelivery = tempDelivery;
        }
      })
    );
  }

  goToCart() {
    this.sidebarDataService.changeSidebarName('checkout-cart');
    $('.drawer').drawer('open');

    $('#PurchaseWarningModal').modal('hide');
  }

  emptyCart() {
    localStorage.setItem('OneTime', JSON.stringify([]));
    localStorage.setItem('EveryMonth', JSON.stringify([]));
    localStorage.removeItem('Promoter');

    const foodDelivery = {
      totalItems: 0,
      totalPrice: 0,
      appliedDiscount: 0,
    };

    this.store.dispatch(new SetFoodDeliveryActon(foodDelivery));

    localStorage.setItem('FoodDelivery', JSON.stringify(foodDelivery));

    this.dataService.setPromoterData([]);

    this.sidebarDataService.changeSidebarName('');

    this.sidebarDataService.changeCartStatus(false);

    $('#PurchaseWarningModal').modal('hide');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
