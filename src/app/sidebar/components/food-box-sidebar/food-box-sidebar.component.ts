import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import { FoodDelivery } from 'src/app/foods/models/food-delivery.model';
import { FoodDiscount } from 'src/app/foods/models/food-discount.model';
import { Food } from 'src/app/foods/models/food.model';
import { SetFoodDeliveryActon } from 'src/app/foods/store/foods-list.actions';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppCheckoutService } from 'src/app/shared/services/app-checkout.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { SidebarDataService } from '../../services/sidebar-data.service';
declare var $: any;

@Component({
  selector: 'app-food-box-sidebar',
  templateUrl: './food-box-sidebar.component.html',
  styleUrls: ['./food-box-sidebar.component.css'],
})
export class FoodBoxSidebarComponent implements OnInit, OnDestroy {
  country = '';
  language = '';
  foods: Food[] = [];
  box = {
    boxNo: 0,
    boxItems: 0,
    boxLimit: 0,
  };
  boxTotalPrice = 0;
  discount = {} as { numberOfBox?: number; discountPercent?: number };
  discountInfo = {} as FoodDiscount;
  discountedItems = 0;
  isEditSelections = false;
  isStaging: boolean;
  gaCode = '';
  fbCode = '';
  googleConversionId = '';
  googleConversionLabel = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private store: Store<AppState>,
    private sidebarDataService: SidebarDataService,
    private appUtilityService: AppUtilityService,
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private appCheckoutService: AppCheckoutService,
    private productsDataService: ProductsDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getCountry();
    this.getLanguage();
    this.getReferrer();
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

  getReferrer() {
    if (this.isStaging) {
      this.route.queryParamMap.subscribe((params) => {
        const refCode = params.get('ref');
        if (refCode !== null) {
          this.subscriptions.push(
            this.dataService.currentReferrerData.subscribe((referrer: any) => {
              if (referrer) {
                this.gaCode = referrer.ga_track_id;
                this.fbCode = referrer.fb_pixel_id;
                this.googleConversionId = referrer.ga_ad_track_id
                  ? referrer.ga_ad_track_id
                  : '';
                this.googleConversionLabel = referrer.ga_ad_conv_lbl
                  ? referrer.ga_ad_conv_lbl
                  : '';
              }
            })
          );
        }
      });
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.gaCode = referrer.ga_track_id;
            this.fbCode = referrer.fb_pixel_id;
            this.googleConversionId = referrer.ga_ad_track_id
              ? referrer.ga_ad_track_id
              : '';
            this.googleConversionLabel = referrer.ga_ad_conv_lbl
              ? referrer.ga_ad_conv_lbl
              : '';
          }
        })
      );
    }
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;
        this.box.boxItems = res.boxes.noOfItems;
        this.box.boxLimit = res.boxes.currentLimit;
        this.box.boxNo = res.boxes.currentlyFilled + 1;

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          return (
            sum +
            (food.quantity && food.quantity > 0
              ? food.price * food.quantity
              : 0)
          );
        }, 0);

        this.discountInfo = res.discountsInfo;

        if (this.discountInfo.itemsPerBox) {
          this.discountedItems =
            this.box.boxLimit - this.box.boxItems !== 0
              ? this.box.boxLimit - this.box.boxItems
              : this.discountInfo.itemsPerBox;
        }

        this.discount =
          this.box.boxLimit - this.box.boxItems !== 0
            ? this.discountInfo.discounts.find(
                (discount) => discount.numberOfBox === this.box.boxNo
              ) || {}
            : this.discountInfo.discounts.find(
                (discount) => discount.numberOfBox === this.box.boxNo + 1
              ) || {};

        this.getEditSelectionsStatus();
      })
    );
  }

  getEditSelectionsStatus() {
    const LocalMVUser = localStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const LocalCartTime = localStorage.getItem('CartTime');
    const cartStorageValue = LocalCartTime ? JSON.parse(LocalCartTime) : null;
    const currentTime = new Date().getTime();
    const timeDifference = (currentTime - cartStorageValue) / 1000;

    if (cartStorageValue !== null) {
      if (FoodUser !== null) {
        if (timeDifference > FoodUser.token_expire_time) {
          this.isEditSelections = false;
        } else {
          if (FoodUser.isEditSelections) {
            this.isEditSelections = true;
          } else {
            this.isEditSelections = false;
          }
        }
      } else {
        this.isEditSelections = false;
      }
    } else {
      this.isEditSelections = false;
    }
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

      if (this.isEditSelections) {
        this.appCheckoutService.checkoutFood(
          this.country,
          this.language,
          this.gaCode,
          this.fbCode,
          this.googleConversionId,
          this.googleConversionLabel
        );
        $('.drawer').drawer('close');
      } else {
        this.sidebarDataService.changeSidebarName('checkout-cart');
        $('.drawer').drawer('open');
      }
    }
  }

  onClickClose() {
    $('.drawer').drawer('close');
    this.sidebarDataService.changeSidebarName('');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
