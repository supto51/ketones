import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { environment } from 'src/environments/environment';
import { AppDataService } from './app-data.service';
import * as cryptojs from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class AppCheckoutService implements OnDestroy {
  foodCheckoutURL = '';
  isStaging: boolean;
  redirectURL = '';
  sha256Salt = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private sidebarDataService: SidebarDataService,
    private route: ActivatedRoute
  ) {
    this.isStaging = environment.isStaging;
    this.foodCheckoutURL = environment.foodCheckoutUrl;
    this.redirectURL = environment.redirectURL;
    this.sha256Salt = environment.shaSalt;
  }

  checkoutFood(
    country: string,
    language: string,
    gaCode: string,
    fbCode: string,
    googleConversionId: string,
    googleConversionLabel: string
  ) {
    this.dataService.setIsCheckoutFromFoodStatus(true);

    const LocalMVUser = localStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

    const LocalCartTime = localStorage.getItem('CartTime');
    const cartStorageValue = LocalCartTime ? JSON.parse(LocalCartTime) : null;
    const currentTime = new Date().getTime();
    const timeDifference = (currentTime - cartStorageValue) / 1000;

    const LocalVIUser = localStorage.getItem('ViUser');
    const viUser = LocalVIUser ? JSON.parse(LocalVIUser) : null;

    if (viUser !== null) {
      this.setFoodCheckoutUrl(
        viUser.referrer,
        false,
        viUser.promptLogin,
        viUser.viCode,
        country,
        language,
        gaCode,
        fbCode,
        googleConversionId,
        googleConversionLabel
      );
    } else {
      if (cartStorageValue !== null) {
        if (FoodUser !== null) {
          if (timeDifference > FoodUser.token_expire_time) {
            localStorage.removeItem('MVUser');
            localStorage.removeItem('Foods');
            localStorage.removeItem('FoodDelivery');

            this.sidebarDataService.setShortenedUrlLink('');
            this.setModals();
          } else {
            const autoshipFoods: { sku: string; quantity: number }[] =
              FoodUser === null ||
              (Object.keys(FoodUser).length === 0 &&
                FoodUser.constructor === Object)
                ? []
                : FoodUser.food_autoship_data;

            if (autoshipFoods.length !== 0 || FoodUser.isEditSelections) {
              this.setFoodCheckoutUrl(
                FoodUser.mvuser_refCode,
                true,
                'true',
                '',
                country,
                language,
                gaCode,
                fbCode,
                googleConversionId,
                googleConversionLabel
              );
            } else {
              this.setFoodCheckoutUrl(
                FoodUser.mvuser_refCode,
                false,
                'true',
                '',
                country,
                language,
                gaCode,
                fbCode,
                googleConversionId,
                googleConversionLabel
              );
            }
          }
        } else {
          localStorage.removeItem('MVUser');
          localStorage.removeItem('Foods');
          localStorage.removeItem('FoodDelivery');

          this.sidebarDataService.setShortenedUrlLink('');
          this.setModals();
        }
      } else {
        localStorage.removeItem('MVUser');
        localStorage.removeItem('Foods');
        localStorage.removeItem('FoodDelivery');

        this.sidebarDataService.setShortenedUrlLink('');
        this.setModals();
      }
    }
  }

  setFoodCheckoutUrl(
    refCode: string,
    isAutoshipFoods: boolean,
    promptLogin: string,
    viCode: string,
    country: string,
    language: string,
    gaCode: string,
    fbCode: string,
    googleConversionId: string,
    googleConversionLabel: string
  ) {
    let checkoutLink = '';

    let foodSkus = '';

    const LocalCheckoutFoods = localStorage.getItem('CheckoutFoods');
    let CheckoutFoods: FoodCart[] = LocalCheckoutFoods
      ? JSON.parse(LocalCheckoutFoods)
      : null;
    if (!CheckoutFoods) {
      CheckoutFoods = [];
    }

    if (!isAutoshipFoods) {
      CheckoutFoods.forEach((food: FoodCart, index: any) => {
        foodSkus += food.food.sku + '-ONCE' + ':' + food.food.quantity;
        if (CheckoutFoods.length - 1 !== index) {
          foodSkus += ',';
        }
      });
    } else {
      CheckoutFoods.forEach((food: FoodCart, index: any) => {
        foodSkus += food.food.sku + '-RENEW' + ':' + food.food.quantity;
        if (CheckoutFoods.length - 1 !== index) {
          foodSkus += ',';
        }
      });
    }

    checkoutLink =
      this.foodCheckoutURL +
      refCode +
      '?products=' +
      foodSkus +
      '&country=' +
      country.toLowerCase() +
      '&catalog=sunbasket' +
      '&redirect_url=' +
      this.redirectURL +
      '&language=' +
      language +
      '&gaCode=' +
      gaCode +
      '&fbCode=' +
      fbCode +
      '&googleConversionId=' +
      googleConversionId +
      '&googleConversionLabel=' +
      googleConversionLabel +
      '&promptLogin=' +
      promptLogin;

    checkoutLink =
      viCode !== '' ? checkoutLink + '&vicode=' + viCode : checkoutLink;

    const hash = cryptojs
      .SHA256(checkoutLink + this.sha256Salt)
      .toString(cryptojs.enc.Hex)
      .toUpperCase();

    checkoutLink += '&hash=' + hash;

    const height = 760;
    const width = 500;
    const leftPosition = window.innerWidth / 2 - width / 2;
    const topPosition =
      window.innerHeight / 2 -
      height / 2 +
      (window.outerHeight - window.innerHeight);

    window.open(
      checkoutLink,
      'checkoutWindowRef',
      'status=no,height=' +
        height +
        ',width=' +
        width +
        ',resizable=yes,left=' +
        leftPosition +
        ',top=' +
        topPosition +
        ',screenX=' +
        leftPosition +
        ',screenY=' +
        topPosition +
        ',toolbar=no,menubar=no,scrollbars=no,location=no,directories=no'
    );
  }

  setModals() {
    const modals = [];
    let referrerModal = '';

    if (this.isStaging) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe((params) => {
          const refCode = params.get('ref');
          if (refCode !== null) {
            this.subscriptions.push(
              this.dataService.currentReferrerData.subscribe(
                (referrer: any) => {
                  if (referrer) {
                    referrerModal = 'referrerBy';
                  }
                }
              )
            );
          } else {
            referrerModal = 'referrerCode';
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            if (referrer.code !== '') {
              referrerModal = 'referrerBy';
            } else {
              referrerModal = 'referrerCode';
            }
          }
        })
      );
    }

    if (referrerModal === '') {
      referrerModal = 'referrerCode';
    }

    modals.push({ modalName: referrerModal });

    this.sidebarDataService.changeCartOrCheckoutModal('checkout');
    this.dataService.changeModals(modals);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
