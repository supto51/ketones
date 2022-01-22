import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { FoodCart } from '../../models/food-cart.model';
import { FoodDelivery } from '../../models/food-delivery.model';
import { FoodDiscount } from '../../models/food-discount.model';
import { PreloadedMenus } from '../../models/food-preloaded-menus.model';
import { QuickAddMenus } from '../../models/food-quickadd-menus.model';
import { Food } from '../../models/food.model';
import { FoodUtilityService } from '../../services/food-utility.service';
import {
  SetFoodDeliveryActon,
  SetFoodsAction,
  SetQuickAddMenusActon,
} from '../../store/foods-list.actions';
declare var $: any;

@Component({
  selector: 'app-foods-box',
  templateUrl: './foods-box-footer.component.html',
  styleUrls: ['./foods-box-footer.component.css'],
})
export class FoodsBoxFooterComponent implements OnInit, OnDestroy {
  country = '';
  language = '';
  foods: Food[] = [];
  box = {
    boxNo: 0,
    boxItems: 0,
    boxLimit: 0,
  };
  boxTotalPrice = 0;
  preloadedMenus = {} as PreloadedMenus;
  discount = {} as { numberOfBox?: number; discountPercent?: number };
  discountInfo = {} as FoodDiscount;
  discountedItems = 0;
  quickAddMenus = {} as QuickAddMenus;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private sidebarDataService: SidebarDataService,
    private foodUtilityService: FoodUtilityService,
    private dataService: AppDataService,
    private appUtilityService: AppUtilityService,
    private productsDataService: ProductsDataService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getFoods();
  }

  getCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe(
        (countryCode: string) => {
          this.country = countryCode;
        }
      )
    );
  }

  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.language = language;
      })
    );
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;
        this.preloadedMenus = res.preloadedMenus;
        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;
        this.discountInfo = res.discountsInfo;

        this.quickAddMenus = res.quickAddMenus;

        if (this.discountInfo.itemsPerBox) {
          this.discountedItems =
            this.box.boxLimit - this.box.boxItems !== 0
              ? this.box.boxLimit - this.box.boxItems
              : this.discountInfo.itemsPerBox;
        }

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          return (
            sum +
            (food.quantity && food.quantity > 0
              ? food.price * food.quantity
              : 0)
          );
        }, 0);

        this.discount =
          this.box.boxLimit - this.box.boxItems !== 0
            ? this.discountInfo.discounts.find(
                (discount) => discount.numberOfBox === this.box.boxNo
              ) || {}
            : this.discountInfo.discounts.find(
                (discount) => discount.numberOfBox === this.box.boxNo + 1
              ) || {};
      })
    );
  }

  onClickAddToCart() {
    let appliedDiscount = 0;

    const noOfBoxes = this.discountInfo.itemsPerBox
      ? this.box.boxItems / this.discountInfo.itemsPerBox
      : 0;

    this.discountInfo.discounts.forEach((discount) => {
      for (let i = 1; i <= noOfBoxes; i++) {
        if (discount.numberOfBox === i) {
          appliedDiscount = discount.discountPercent
            ? discount.discountPercent
            : 0;
        }
      }
    });
    const deliveryInfo: FoodDelivery = {
      totalItems: this.box.boxItems,
      totalPrice: this.boxTotalPrice,
      appliedDiscount: appliedDiscount,
      shippingDateShort: this.discountInfo.shippingDateShort
        ? this.discountInfo.shippingDateShort
        : '',
      autoshipShippingDateShort: this.discountInfo.autoshipShippingDateShort
        ? this.discountInfo.autoshipShippingDateShort
        : '',
      editDate: this.discountInfo.editDate ? this.discountInfo.editDate : '',
    };

    const isInvalidSupplement = this.appUtilityService.showPurchaseWarningPopup(
      this.country,
      this.language,
      true
    );

    if (isInvalidSupplement) {
      this.productsDataService.changePostName('purchase-modal');
      $('#PurchaseWarningModal').modal('show');
    } else {
      let CheckoutFoods: FoodCart[] = [];

      this.foods.forEach((food) => {
        if (food.quantity !== 0) {
          CheckoutFoods.push({
            country: this.country,
            language: this.language,
            food: food,
          });
        }
      });

      localStorage.setItem('CheckoutFoods', JSON.stringify(CheckoutFoods));

      this.store.dispatch(new SetFoodDeliveryActon(deliveryInfo));

      localStorage.setItem('FoodDelivery', JSON.stringify(deliveryInfo));

      const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);
      tempQuickAddMenus.quantity = 0;

      this.store.dispatch(new SetQuickAddMenusActon(tempQuickAddMenus));

      this.sidebarDataService.changeSidebarName('checkout-cart');
      $('.drawer').drawer('open');
    }
  }

  preloadRyansMenu() {
    const updatedFoods = this.foods.map((food) => {
      const tempFood = Object.assign({}, food);
      this.preloadedMenus.menus.forEach((item) => {
        if (item.id === food.id && !food.isOutOfStock) {
          tempFood.quantity = item.quantity;
        }
      });
      return tempFood;
    });

    this.store.dispatch(new SetFoodsAction(updatedFoods));
    this.foodUtilityService.saveFoodsToLocalStorage(
      updatedFoods,
      this.country,
      this.language
    );

    this.sidebarDataService.changeSidebarName('food-summary');
    $('.drawer').drawer('open');
  }

  onClickBox() {
    const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);
    tempQuickAddMenus.quantity = 0;

    this.store.dispatch(new SetQuickAddMenusActon(tempQuickAddMenus));

    this.sidebarDataService.changeSidebarName('food-summary');

    setTimeout(() => {
      $('.drawer').drawer('open');
    }, 0);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
