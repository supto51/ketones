import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { SidebarDataService } from '../../services/sidebar-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarApiService } from '../../services/sidebar-api.service';
import { CartTotalOneTime } from '../../models/one-time.model';
import { CartTotalEveryMonth } from '../../models/every-month.model';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { FoodDelivery } from 'src/app/foods/models/food-delivery.model';
import { SetFoodDeliveryActon } from 'src/app/foods/store/foods-list.actions';
import { FoodUtilityService } from 'src/app/foods/services/food-utility.service';
import { FoodCart } from 'src/app/foods/models/food-cart.model';
import * as cryptojs from 'crypto-js';
import { Food } from 'src/app/foods/models/food.model';
declare var $: any;

@Component({
  selector: 'app-checkout-cart',
  templateUrl: './checkout-cart.component.html',
  styleUrls: ['./checkout-cart.component.css'],
})
export class CheckoutCartComponent implements OnInit, AfterViewInit, OnDestroy {
  oneTimeCart: any[] = [];
  everyMonthCart: any[] = [];
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  isSmartShipDiscount = 0;
  currencySymbol = '$';
  clientId = '';
  returningUrl = '';
  promoterCart: any = {};
  shippingPolicyLink = '';
  refCode = '';
  productSkus = '';
  checkoutURL = '';
  foodCheckoutURL = '';
  gaCode = '';
  fbCode = '';
  redirectURL = '';
  bitlyLink = '';
  clientDomain = '';
  googleConversionId = '';
  googleConversionLabel = '';
  stringifiedProductSku = '';
  isStaging: boolean;
  subscriptions: SubscriptionLike[] = [];
  defaultLanguage = '';
  isCartTotalOfferShown = false;
  isCartTotalOfferPreviouslyShown = false;
  oneTimeCartTotalSumPrice: string | number = 0;
  oneTimeCartTotalDiscountSumPrice: string | number = 0;

  defaultOfferText = {
    unlockedText: '',
    almostUnlockedText: '',
    claimText: '',
  };

  cartTotalOneTime: CartTotalOneTime[] = [];
  cartTotalEveryMonth: CartTotalEveryMonth[] = [];

  foods: Food[] = [];
  foodDelivery = {
    totalItems: 0,
    totalPrice: 0,
    appliedDiscount: 0,
  } as FoodDelivery;
  shippingDate = '';
  sha256Salt = '';
  isAutoshipDataLoading = false;

  constructor(
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private sidebarDataService: SidebarDataService,
    private sidebarApiService: SidebarApiService,
    private foodUtilityService: FoodUtilityService,
    private store: Store<AppState>
  ) {
    this.isStaging = environment.isStaging;
    this.redirectURL = environment.redirectURL;
    this.checkoutURL = environment.checkoutURL;
    this.returningUrl = environment.returningURL;
    this.clientDomain = environment.clientDomainURL;
    this.clientId = environment.clientID;
    this.sha256Salt = environment.shaSalt;
    this.foodCheckoutURL = environment.foodCheckoutUrl;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getFoodDelivery();
    this.getCurrentCart();
    this.getProducts();
    this.getReferrer();
    this.getCheckoutStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getFoodDelivery() {
    const LocalFoodDelivery = localStorage.getItem('FoodDelivery');
    let FoodDelivery: FoodDelivery = LocalFoodDelivery
      ? JSON.parse(LocalFoodDelivery)
      : null;

    const LocalMVUser = localStorage.getItem('MVUser');
    const FoodUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;
    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    if (FoodDelivery !== null) {
      if (FoodDelivery.totalItems !== 0) {
        this.foodDelivery = FoodDelivery;
        this.shippingDate =
          FoodUser !== null && autoshipFoods.length > 0
            ? FoodDelivery.autoshipShippingDateShort
              ? this.foodUtilityService.removeDayFromFullDate(
                  FoodDelivery.autoshipShippingDateShort
                )
              : ''
            : FoodDelivery.shippingDateShort
            ? this.foodUtilityService.removeDayFromFullDate(
                FoodDelivery.shippingDateShort
              )
            : '';
      }
    }

    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;

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

        if (
          !(
            res.discountsInfo &&
            Object.keys(res.discountsInfo).length === 0 &&
            res.discountsInfo.constructor === Object
          )
        ) {
          this.shippingDate =
            FoodUser !== null && autoshipFoods.length > 0
              ? this.foodUtilityService.removeDayFromFullDate(
                  res.discountsInfo.autoshipShippingDateShort
                )
              : this.foodUtilityService.removeDayFromFullDate(
                  res.discountsInfo.shippingDateShort
                );
        }
      })
    );
  }

  getCheckoutStatus() {
    this.dataService.currentIsCheckout.subscribe((isCheckout) => {
      if (isCheckout) {
        this.sidebarDataService.setShortenedUrlLink('');
        this.getCurrentCart();
        this.setProductSkus();

        this.setOneTimeCartTotalDiscount();
        this.setOneTimePriceAndStatus();
        this.removeInitialFromOneTimeTiers();

        this.setEveryMonthCartTotalDiscount();
        this.setEveryMonthPrice();
        this.removeInitialFromSmartshipTiers();

        this.removeCartTotalOfferIfNotMet();

        this.setModals();
        this.dataService.setIsCheckoutStatus(false);
      }
    });
  }

  setTinyUrlLink() {
    const checkoutUrl =
      this.checkoutURL +
      this.refCode +
      '?products=' +
      this.productSkus +
      '&country=' +
      this.selectedCountry.toLowerCase() +
      '&redirect_url=' +
      this.redirectURL +
      '&language=' +
      this.selectedLanguage +
      '&gaCode=' +
      this.gaCode +
      '&fbCode=' +
      this.fbCode;

    this.sidebarApiService.getTinyUrl(checkoutUrl).subscribe((res: any) => {
      if (res) {
        this.bitlyLink = res;
        this.sidebarDataService.setShortenedUrlLink(this.bitlyLink);
      }
    });
  }

  getReferrer() {
    if (this.isStaging) {
      this.route.queryParamMap.subscribe((params) => {
        const refCode = params.get('ref');
        if (refCode !== null) {
          this.refCode = refCode;
          this.subscriptions.push(
            this.dataService.currentReferrerData.subscribe((referrer: any) => {
              if (referrer) {
                this.refCode = referrer.code;
                this.gaCode = referrer.ga_track_id;
                this.fbCode = referrer.fb_pixel_id;
                this.googleConversionId = referrer.ga_ad_track_id
                  ? referrer.ga_ad_track_id
                  : '';
                this.googleConversionLabel = referrer.ga_ad_conv_lbl
                  ? referrer.ga_ad_conv_lbl
                  : '';

                this.setTinyUrlLink();
              }
            })
          );
        }
      });
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.refCode = referrer.code;
            this.gaCode = referrer.ga_track_id;
            this.fbCode = referrer.fb_pixel_id;
            this.googleConversionId = referrer.ga_ad_track_id
              ? referrer.ga_ad_track_id
              : '';
            this.googleConversionLabel = referrer.ga_ad_conv_lbl
              ? referrer.ga_ad_conv_lbl
              : '';

            this.setTinyUrlLink();
          }
        })
      );
    }
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.setDefaultOfferTexts();
      })
    );
  }

  setDefaultOfferTexts() {
    let unlockedText = '';
    let almostUnlockedText = '';
    let claimText = '';

    this.translate
      .get('youve-unlocked-a-cart-total-discount-1')
      .subscribe((res1: string) => {
        this.translate
          .get('youve-unlocked-a-cart-total-discount-2')
          .subscribe((res2: string) => {
            unlockedText = `🎉 ${res1} <strong>${res2}</strong>`;
          });
      });

    this.translate
      .get('youve-almost-unlocked-a-cart-total-discount')
      .subscribe((res: string) => {
        almostUnlockedText = res;
      });

    this.translate
      .get('add-an-eligible-product-to-claim-offer')
      .subscribe((res: string) => {
        claimText = res;
      });

    this.defaultOfferText.unlockedText = unlockedText;
    this.defaultOfferText.almostUnlockedText = almostUnlockedText;
    this.defaultOfferText.claimText = claimText;
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getSmartShipDiscountStatus() {
    this.isSmartShipDiscount = this.productsData.smartship_discount;
  }

  getCurrentCart() {
    this.oneTimeCart = this.utilityService.getOneTimeStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );
    this.everyMonthCart = this.utilityService.getEveryMonthStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      this.promoterCart &&
      Object.keys(this.promoterCart).length === 0 &&
      this.promoterCart.constructor === Object &&
      this.foodDelivery?.totalItems === 0
    ) {
      this.sidebarDataService.changeCartStatus(false);
    } else {
      this.sidebarDataService.changeCartStatus(true);
    }
  }

  getOneTimeCart(cartOneTime: any[]) {
    const tempOneTimeCart: any[] = [];
    cartOneTime.forEach((oneTime) => {
      if (
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_1') ||
        (oneTime.country === this.selectedCountry.toLowerCase() &&
          oneTime.language === this.selectedLanguage &&
          oneTime.orderType === 'ordertype_3')
      ) {
        tempOneTimeCart.push(oneTime);
      }
    });
    return tempOneTimeCart;
  }

  getEveryMonthCart(cartEveryMonth: any[]) {
    const tempEveryMonthCart: any[] = [];
    cartEveryMonth.forEach((everyMonth) => {
      if (
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_2') ||
        (everyMonth.country === this.selectedCountry.toLowerCase() &&
          everyMonth.language === this.selectedLanguage &&
          everyMonth.orderType === 'ordertype_3')
      ) {
        tempEveryMonthCart.push(everyMonth);
      }
    });
    return tempEveryMonthCart;
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;
            this.getCurrencySymbol();
            this.getSmartShipDiscountStatus();
            this.getPromoterProduct();
            this.getSinglePromoter();
            this.setProductSkus();
            this.getShippingPolicy();

            this.setOneTimeCartTotalDiscount();
            this.setOneTimePriceAndStatus();
            this.removeInitialFromOneTimeTiers();

            this.setCartTotalOfferPreviouslyShownStatus();

            this.setEveryMonthCartTotalDiscount();
            this.setEveryMonthPrice();
            this.removeInitialFromSmartshipTiers();

            this.removeCartTotalOfferIfNotMet();
          }
        }
      )
    );
  }

  setCartTotalOfferPreviouslyShownStatus() {
    let isCartTotalOfferFound = false;

    if (this.productsData.hasOwnProperty('offer')) {
      this.productsData.offer.forEach((offer: any) => {
        if (offer.offer_type === 'cart_total') {
          let cartTotalPrice = this.getCartTotalPrice(offer);
          let totalPriceOver = +offer.price_over;
          let totalPriceUnder = +offer.price_under;

          if (
            cartTotalPrice >= totalPriceOver &&
            cartTotalPrice <= totalPriceUnder
          ) {
            isCartTotalOfferFound = true;
          }
        }
      });
    }

    this.isCartTotalOfferPreviouslyShown = isCartTotalOfferFound;
  }

  setOneTimeCartTotalDiscount() {
    if (this.productsData) {
      const cartTotalDiscount = this.productsData.cart_total_discount;

      const cartTotalDiscountOneTime: any[] = cartTotalDiscount?.onetime;

      if (cartTotalDiscountOneTime) {
        cartTotalDiscountOneTime.forEach((discount: any, index: number) => {
          const settings = discount?.cart_total_settings;

          const qualifiedSkus = this.getOneTimeQualifiedSkus(discount);

          const discountedSkus = this.getOneTimeDiscountedSkus(discount);

          const isEnabled = this.checkOneTimeCartTotalEnabled(qualifiedSkus);

          const sumPrice = this.calculateOneTimeTotalSumPrice(
            qualifiedSkus,
            settings
          );

          const requiredPrice = this.getOneTimeCartTotalRequiredPrice(
            settings,
            sumPrice
          );

          const bannerText = this.getOneTimeCartTotalBannerText(
            settings,
            requiredPrice
          );

          const progressPercent = this.getOneTimeCartTotalProgressPercent(
            settings,
            requiredPrice
          );

          const isUnlocked = this.checkOneTimeCartTotalUnlocked(
            settings,
            isEnabled,
            requiredPrice
          );

          const isAlmostUnlocked = this.checkOneTimeCartTotalAlmostUnlocked(
            settings,
            isEnabled,
            requiredPrice
          );

          const unlockedText = settings?.banner_info
            ?.discount_unlocked_text as string;

          const almostUnlockedText = settings?.banner_info
            ?.discount_eligble_text_1 as string;

          const claimText = settings?.banner_info
            ?.discount_eligble_text_2 as string;

          const discountObj = Object.assign(
            {},
            {
              settings: settings,
              qualifiedSkus: qualifiedSkus,
              discountedSkus: discountedSkus,
              isEnabled: isEnabled,
              sumPrice: sumPrice,
              requiredPrice: requiredPrice,
              bannerText: bannerText,
              progressPercent: progressPercent,
              isUnlocked: isUnlocked,
              isAlmostUnlocked: isAlmostUnlocked,
              unlockedText: unlockedText ? unlockedText : '',
              almostUnlockedText: almostUnlockedText ? almostUnlockedText : '',
              claimText: claimText ? claimText : '',
              showItem: true,
            }
          );

          this.cartTotalOneTime[index] = discountObj;
        });
      }
    }
  }

  setOneTimePriceAndStatus() {
    let tempSumPrice = 0;
    let tempDiscountSumPrice = 0;

    this.oneTimeCart.forEach((oneTimeItem: any) => {
      let price = Number.MAX_VALUE;
      let status = false;

      for (let index = 0; index < this.cartTotalOneTime.length; index++) {
        const productPrice = this.getOneTimeNonOfferPriceAndStatus(
          oneTimeItem.cart.discountPrice,
          oneTimeItem.cart.smartshipDiscountPrice,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.productSku.oneTime,
          index
        ).price;
        const productStatus = this.getOneTimeNonOfferPriceAndStatus(
          oneTimeItem.cart.discountPrice,
          oneTimeItem.cart.smartshipDiscountPrice,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.productSku.oneTime,
          index
        ).status;

        if (productStatus && productPrice < price) {
          price = productPrice;
          status = productStatus;
        }
      }

      if (price === Number.MAX_VALUE) {
        price = 0;
      }

      if (!status) {
        price = this.getOneTimeNonOfferPriceAndStatus(
          oneTimeItem.cart.discountPrice,
          oneTimeItem.cart.smartshipDiscountPrice,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.productSku.oneTime,
          0
        ).price;
        status = this.getOneTimeNonOfferPriceAndStatus(
          oneTimeItem.cart.discountPrice,
          oneTimeItem.cart.smartshipDiscountPrice,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.productSku.oneTime,
          0
        ).status;
      }

      let finalPriceAndStatus = {} as any;

      if (
        oneTimeItem.cart.discountType === 'sku_purchase' ||
        oneTimeItem.cart.discountType === 'cart_total'
      ) {
        finalPriceAndStatus = this.getSkuBasedOffer(
          oneTimeItem.cart.quantity,
          price,
          oneTimeItem.cart.productSku.oneTime,
          oneTimeItem.cart.productID,
          status,
          oneTimeItem.cart.price.oneTime,
          oneTimeItem.cart.discountType
        );
      } else {
        finalPriceAndStatus = {
          price: this.getNumFormat(
            oneTimeItem.cart.quantity * this.getExchangedPrice(price)
          ),
          status: status,
        };
      }

      oneTimeItem.regularDiscountPercent = this.setRegularDiscountPercent(
        oneTimeItem.cart.discountPrice,
        oneTimeItem.cart.smartshipDiscountPrice,
        oneTimeItem.cart.discountPercent,
        oneTimeItem.cart.smartshipDiscountPercent
      );
      oneTimeItem.finalPrice = this.getNumFormat(+finalPriceAndStatus.price);
      oneTimeItem.status = finalPriceAndStatus.status;

      tempDiscountSumPrice += +finalPriceAndStatus.price;
      tempSumPrice += +this.getCartItemPrice(
        oneTimeItem.cart.quantity *
          this.getExchangedPrice(oneTimeItem.cart.price.oneTime)
      );
    });

    if (this.promoterCart.price) {
      tempSumPrice += this.getExchangedPrice(this.promoterCart.price);
      tempDiscountSumPrice += this.getExchangedPrice(this.promoterCart.price);
    }

    this.oneTimeCartTotalSumPrice = this.getNumFormat(tempSumPrice);
    this.oneTimeCartTotalDiscountSumPrice =
      this.getNumFormat(tempDiscountSumPrice);
  }

  setRegularDiscountPercent(
    discountPrice: number,
    smartshipDiscountPrice: number,
    discountPercent: number,
    smartshipDiscountPercent: number
  ) {
    let percent = 0;

    if (smartshipDiscountPrice !== 0) {
      if (this.everyMonthCart.length > 0) {
        percent =
          smartshipDiscountPrice >= discountPrice && discountPrice !== 0
            ? discountPercent
            : smartshipDiscountPercent;
      } else {
        percent = discountPercent;
      }
    } else {
      percent = discountPercent;
    }

    return percent;
  }

  getAllOneTimeSameDiscount(): number {
    const isAllSame = this.oneTimeCart.every(
      (item: any) =>
        item.regularDiscountPercent ===
        this.oneTimeCart[0].regularDiscountPercent
    );

    return isAllSame && this.oneTimeCart.length > 0
      ? this.oneTimeCart[0].regularDiscountPercent
      : 0;
  }

  removeInitialFromOneTimeTiers() {
    const isFinalTierMet =
      this.cartTotalOneTime.length > 0
        ? this.cartTotalOneTime[this.cartTotalOneTime.length - 1].isUnlocked
        : false;

    if (isFinalTierMet) {
      this.cartTotalOneTime.forEach(
        (cartTotalItem: CartTotalOneTime, index: number) => {
          if (
            this.cartTotalOneTime.length - 1 !== index &&
            this.cartTotalOneTime.length > 1
          ) {
            cartTotalItem.showItem = false;
          }
        }
      );
    }

    this.cartTotalOneTime.forEach((cartTotalItem: CartTotalOneTime) => {
      const cartTotalItemPercent = cartTotalItem.discountedSkus[0]?.percent;
      const allOneTimeSameDiscount = this.getAllOneTimeSameDiscount();

      if (
        allOneTimeSameDiscount !== 0 &&
        cartTotalItemPercent <= allOneTimeSameDiscount
      ) {
        cartTotalItem.showItem = false;
      }
    });

    const isAllTierShown = this.cartTotalOneTime.every(
      (item: CartTotalOneTime) =>
        item.showItem && !item.isUnlocked && item.isEnabled
    );

    if (isAllTierShown) {
      this.cartTotalOneTime.forEach(
        (cartTotalItem: CartTotalOneTime, index: number) => {
          if (index > 0 && this.cartTotalOneTime.length > 1) {
            cartTotalItem.showItem = false;
          }
        }
      );
    }
  }

  setEveryMonthCartTotalDiscount() {
    if (this.productsData) {
      const cartTotalDiscount = this.productsData.cart_total_discount;

      const cartTotalDiscountSmartship: any[] = cartTotalDiscount?.smartship;

      if (cartTotalDiscountSmartship) {
        cartTotalDiscountSmartship.forEach((discount: any, index: number) => {
          const settings = discount?.smartship_cart_total_settings;

          const qualifiedSkus = this.getEveryMonthQualifiedSkus(discount);

          const discountedSkus = this.getEveryMonthDiscountedSkus(discount);

          const isEnabled = this.checkEveryMonthCartTotalEnabled(qualifiedSkus);

          const sumPrice = this.calculateEveryMonthTotalSumPrice(
            qualifiedSkus,
            settings
          );

          const requiredPrice = this.getEveryMonthCartTotalRequiredPrice(
            settings,
            sumPrice
          );

          const bannerText = this.getEveryMonthCartTotalBannerText(
            settings,
            requiredPrice
          );

          const progressPercent = this.getEveryMonthCartTotalProgressPercent(
            settings,
            requiredPrice
          );

          const unlockedText = settings?.banner_info
            ?.discount_unlocked_text as string;

          const almostUnlockedText = settings?.banner_info
            ?.discount_eligble_text_1 as string;

          const claimText = settings?.banner_info
            ?.discount_eligble_text_2 as string;

          const discountObj = Object.assign(
            {},
            {
              settings: settings,
              qualifiedSkus: qualifiedSkus,
              discountedSkus: discountedSkus,
              isEnabled: isEnabled,
              sumPrice: sumPrice,
              requiredPrice: requiredPrice,
              bannerText: bannerText,
              progressPercent: progressPercent,
              unlockedText: unlockedText ? unlockedText : '',
              almostUnlockedText: almostUnlockedText ? almostUnlockedText : '',
              claimText: claimText ? claimText : '',
              showItem: true,
            }
          );

          this.cartTotalEveryMonth[index] = discountObj;
        });
      }
    }
  }

  setEveryMonthPrice() {
    this.everyMonthCart.forEach((everyMonthItem: any) => {
      let productPrice = everyMonthItem.cart.price.everyMonth;

      for (let index = 0; index < this.cartTotalEveryMonth.length; index++) {
        const price = this.getEveryMonthNonOfferPrice(
          everyMonthItem.cart.price.oneTime,
          everyMonthItem.cart.price.everyMonth,
          everyMonthItem.cart.productSku.everyMonth,
          index
        );

        if (price < productPrice) {
          productPrice = price;
        }
      }

      if (
        everyMonthItem.cart.discountType === 'sku_purchase' ||
        everyMonthItem.cart.discountType === 'cart_total'
      ) {
        let offerDiscount = 0;
        let currentOffer: any = {};

        let isOfferFound = false;

        this.productsData.offer.forEach((offer: any) => {
          if (offer.product.product_info.ID === everyMonthItem.cart.productID) {
            currentOffer = offer;
          }
        });

        Object.entries(currentOffer.product.discount.smartship).forEach(
          (smartshipOffer: any[]) => {
            if (
              smartshipOffer[0] === everyMonthItem.cart.productSku.everyMonth
            ) {
              offerDiscount = +smartshipOffer[1];
            }
          }
        );

        if (everyMonthItem.cart.discountType === 'cart_total') {
          isOfferFound = this.isCartTotalOffer(currentOffer);
        }

        if (everyMonthItem.cart.discountType === 'sku_purchase') {
          isOfferFound = this.isSkuBaseOffer(currentOffer);
        }

        if (isOfferFound) {
          productPrice = productPrice - offerDiscount;
        }
      }

      everyMonthItem.finalPrice = this.getNumFormat(
        everyMonthItem.cart.quantity * this.getExchangedPrice(productPrice)
      );
    });
  }

  removeInitialFromSmartshipTiers() {
    const isAllTierMet = this.cartTotalEveryMonth.every(
      (item: CartTotalEveryMonth) => item.isEnabled && item.requiredPrice <= 0
    );

    const isAllTierUnlocked = this.cartTotalEveryMonth.every(
      (item: CartTotalEveryMonth) => item.isEnabled && item.requiredPrice > 0
    );

    if (isAllTierMet) {
      this.cartTotalEveryMonth.forEach(
        (cartTotalItem: CartTotalEveryMonth, index: number) => {
          if (
            this.cartTotalEveryMonth.length - 1 !== index &&
            this.cartTotalEveryMonth.length > 1
          ) {
            cartTotalItem.showItem = false;
          }
        }
      );
    }

    if (isAllTierUnlocked) {
      this.cartTotalEveryMonth.forEach(
        (cartTotalItem: CartTotalEveryMonth, index: number) => {
          if (index > 0 && this.cartTotalEveryMonth.length > 1) {
            cartTotalItem.showItem = false;
          }
        }
      );
    }
  }

  /* ---------- get cart total skus --------- */
  getOneTimeQualifiedSkus(cartTotalDiscount: any) {
    const qualifiedSkus: Array<string> = [];

    const qualifiedKeys =
      cartTotalDiscount?.cart_total_discounted_qualified_sku;

    if (qualifiedKeys) {
      Object.entries(qualifiedKeys).forEach((element: any[]) => {
        qualifiedSkus.push(element[1].sku);
      });
    }

    return qualifiedSkus;
  }

  getOneTimeDiscountedSkus(cartTotalDiscount: any) {
    const discountedSkus: Array<{ sku: string; percent: number }> = [];

    const discountedKeys = cartTotalDiscount?.cart_total_discounted_sku;

    if (discountedKeys) {
      Object.entries(discountedKeys).forEach((element: any[]) => {
        discountedSkus.push({
          sku: element[1].sku,
          percent: +element[1].price,
        });
      });
    }

    return discountedSkus;
  }

  getEveryMonthQualifiedSkus(cartTotalDiscount: any) {
    const qualifiedSkus: Array<string> = [];

    const qualifiedKeys =
      cartTotalDiscount?.smartship_cart_total_discounted_qualified_sku;

    if (qualifiedKeys) {
      Object.entries(qualifiedKeys).forEach((element: any[]) => {
        qualifiedSkus.push(element[1].sku);
      });
    }

    return qualifiedSkus;
  }

  getEveryMonthDiscountedSkus(cartTotalDiscount: any) {
    const discountedSkus: Array<{ sku: string; percent: number }> = [];

    const discountedKeys =
      cartTotalDiscount?.smartship_cart_total_discounted_sku;

    if (discountedKeys) {
      Object.entries(discountedKeys).forEach((element: any[]) => {
        discountedSkus.push({
          sku: element[1].sku,
          percent: +element[1].price,
        });
      });
    }

    return discountedSkus;
  }

  /* ---------- one time cart total discounts --------- */
  checkOneTimeCartTotalEnabled(qualifiedSkus: string[]) {
    const isQualifiedSkuFound: boolean = this.oneTimeCart.some(
      (oneTimeItem: any) => {
        return (
          qualifiedSkus.indexOf(oneTimeItem.cart.productSku.oneTime) !== -1
        );
      }
    );

    return isQualifiedSkuFound;
  }

  calculateOneTimeTotalSumPrice(qualifiedSkus: string[], settings: any) {
    return this.oneTimeCart.reduce((sum: number, oneTimeItem: any) => {
      if (qualifiedSkus.indexOf(oneTimeItem.cart.productSku.oneTime) !== -1) {
        const includeRegularDiscount = settings?.include_regular_discount;

        let updatedDiscountPrice = 0;
        if (oneTimeItem.cart.smartshipDiscountPrice !== 0) {
          if (this.everyMonthCart.length > 0) {
            updatedDiscountPrice =
              oneTimeItem.cart.discountPrice <
                oneTimeItem.cart.smartshipDiscountPrice &&
              oneTimeItem.cart.discountPrice !== 0
                ? oneTimeItem.cart.discountPrice
                : oneTimeItem.cart.smartshipDiscountPrice;
          } else {
            updatedDiscountPrice = oneTimeItem.cart.discountPrice;
          }
        } else {
          updatedDiscountPrice = oneTimeItem.cart.discountPrice;
        }

        if (includeRegularDiscount) {
          if (updatedDiscountPrice !== 0) {
            return sum + updatedDiscountPrice * oneTimeItem.cart.quantity;
          } else {
            return (
              sum + oneTimeItem.cart.price.oneTime * oneTimeItem.cart.quantity
            );
          }
        } else {
          return (
            sum + oneTimeItem.cart.price.oneTime * oneTimeItem.cart.quantity
          );
        }
      } else {
        return sum;
      }
    }, 0);
  }

  getOneTimeCartTotalRequiredPrice(settings: any, sumPrice: number) {
    const cartTotalPrice = +settings?.cart_total_price;

    return cartTotalPrice - sumPrice >= 0 ? cartTotalPrice - sumPrice : 0;
  }

  getOneTimeCartTotalBannerText(settings: any, requiredPrice: number) {
    return settings !== ''
      ? (settings?.banner_info?.banner_text as string)?.replace(
          '{XXX}',
          this.currencySymbol +
            this.getNumFormat(this.getExchangedPrice(requiredPrice))
        )
      : '';
  }

  getOneTimeCartTotalProgressPercent(settings: any, requiredPrice: number) {
    const cartTotalPrice = +settings?.cart_total_price;

    return requiredPrice > 0
      ? 100 - Math.round((requiredPrice * 100) / cartTotalPrice)
      : 100;
  }

  checkOneTimeCartTotalUnlocked(
    settings: any,
    isEnabled: boolean,
    requiredPrice: number
  ) {
    let isUnlocked: boolean;

    const isSmartshipOnForOneTime =
      settings?.smartship_discount === 0 ? false : true;

    if (isEnabled && requiredPrice <= 0) {
      if (isSmartshipOnForOneTime) {
        if (this.everyMonthCart.length > 0) {
          isUnlocked = true;
        } else {
          isUnlocked = false;
        }
      } else {
        isUnlocked = true;
      }
    } else {
      isUnlocked = false;
    }

    return isUnlocked;
  }

  checkOneTimeCartTotalAlmostUnlocked(
    settings: any,
    isEnabled: boolean,
    requiredPrice: number
  ) {
    let isAlmostUnlocked: boolean;

    const isSmartshipOnForOneTime =
      settings?.smartship_discount === 0 ? false : true;

    if (isEnabled && requiredPrice <= 0) {
      if (isSmartshipOnForOneTime) {
        if (this.everyMonthCart.length > 0) {
          isAlmostUnlocked = false;
        } else {
          isAlmostUnlocked = true;
        }
      } else {
        isAlmostUnlocked = false;
      }
    } else {
      isAlmostUnlocked = false;
    }

    return isAlmostUnlocked;
  }

  /* ---------- every month cart total discounts --------- */
  checkEveryMonthCartTotalEnabled(qualifiedSkus: string[]) {
    const isQualifiedSkuFound: boolean = this.everyMonthCart.some(
      (everyMonthItem: any) => {
        return (
          qualifiedSkus.indexOf(everyMonthItem.cart.productSku.everyMonth) !==
          -1
        );
      }
    );

    return isQualifiedSkuFound;
  }

  calculateEveryMonthTotalSumPrice(qualifiedSkus: string[], settings: any) {
    return this.everyMonthCart.reduce((sum: number, everyMonthItem: any) => {
      if (
        qualifiedSkus.indexOf(everyMonthItem.cart.productSku.everyMonth) !== -1
      ) {
        const includeRegularDiscount = settings?.include_regular_discount;

        if (includeRegularDiscount) {
          return (
            sum +
            everyMonthItem.cart.price.everyMonth * everyMonthItem.cart.quantity
          );
        } else {
          return (
            sum +
            everyMonthItem.cart.price.oneTime * everyMonthItem.cart.quantity
          );
        }
      } else {
        return sum;
      }
    }, 0);
  }

  getEveryMonthCartTotalRequiredPrice(settings: any, sumPrice: number) {
    const cartTotalPrice = +settings?.cart_total_price;

    return cartTotalPrice - sumPrice >= 0 ? cartTotalPrice - sumPrice : 0;
  }

  getEveryMonthCartTotalBannerText(settings: any, requiredPrice: number) {
    return settings !== ''
      ? (settings?.banner_info?.banner_text as string)?.replace(
          '{XXX}',
          this.currencySymbol +
            this.getNumFormat(this.getExchangedPrice(requiredPrice))
        )
      : '';
  }

  getEveryMonthCartTotalProgressPercent(settings: any, requiredPrice: number) {
    const cartTotalPrice = +settings?.cart_total_price;

    return requiredPrice > 0
      ? 100 - Math.round((requiredPrice * 100) / cartTotalPrice)
      : 100;
  }

  getShippingPolicy() {
    if (this.productsData) {
      const generalSettings = this.productsData.general_settings;

      this.shippingPolicyLink = generalSettings.shipping_policy;
    }
  }

  getPromoterProduct() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      const oneTimeCart = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );
      oneTimeCart.forEach((product: any) => {
        if (product.isPromoter) {
          this.promoterCart.sku = productsSettings.new_promoter_sku;
          this.promoterCart.price = +productsSettings.new_promoter_price;
        }
      });
    }
  }

  getSinglePromoter() {
    this.dataService.currentPromoterData.subscribe((promoterData: any[]) => {
      if (promoterData) {
        promoterData.forEach(
          (promoter: {
            country: string;
            language: string;
            sku: any;
            price: number;
          }) => {
            if (
              promoter.country === this.selectedCountry &&
              promoter.language === this.selectedLanguage
            ) {
              this.promoterCart.sku = promoter.sku;
              this.promoterCart.price = promoter.price;

              if (
                this.oneTimeCart.length === 0 &&
                this.everyMonthCart.length === 0 &&
                this.promoterCart &&
                Object.keys(this.promoterCart).length === 0 &&
                this.promoterCart.constructor === Object &&
                this.foodDelivery?.totalItems === 0
              ) {
                this.sidebarDataService.changeCartStatus(false);
              } else {
                this.sidebarDataService.changeCartStatus(true);
              }

              this.setProductSkus();
            }
          }
        );
      }
    });
  }

  removeCartTotalOfferIfNotMet() {
    const oneTimeCart = this.getLocalStorageCart().oneTime;

    const oneTimeCartOfferItem = oneTimeCart.find(
      (oneTime: any) =>
        this.selectedCountry.toLowerCase() === oneTime.country &&
        oneTime.cart.discountType === 'cart_total'
    );

    if (oneTimeCartOfferItem) {
      if (this.productsData.hasOwnProperty('offer')) {
        this.productsData.offer.forEach((offer: any) => {
          if (
            offer.offer_type === 'cart_total' &&
            offer.product.product_info.ID ===
              oneTimeCartOfferItem.cart.productID
          ) {
            let cartTotalPrice = this.getCartTotalPrice(offer);
            let totalPriceOver = +offer.price_over;

            if (cartTotalPrice < totalPriceOver) {
              this.removeCartItem('OneTimeCart', oneTimeCartOfferItem);
            }
          }
        });
      }
    }
  }

  onClickPromoterRemove() {
    if (confirm('Are you sure you want to remove Promoter product(s)')) {
      const LocalPromoter = localStorage.getItem('Promoter');
      const promoterData = LocalPromoter ? JSON.parse(LocalPromoter) : null;

      if (promoterData !== null) {
        const remainingPromoter = promoterData.filter(
          (promoter: any) =>
            !(
              promoter.country === this.selectedCountry &&
              promoter.language === this.selectedLanguage
            )
        );
        this.dataService.setPromoterData(remainingPromoter);

        localStorage.setItem('Promoter', JSON.stringify(remainingPromoter));
      }

      this.promoterCart = {};

      const oneTimeCart = this.getLocalStorageCart().oneTime;

      const newOneTimeCart = oneTimeCart.filter(
        (oneTime) =>
          !(
            this.selectedCountry.toLowerCase() === oneTime.country &&
            oneTime.isPromoter
          )
      );
      localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
      this.oneTimeCart = this.getOneTimeCart(newOneTimeCart);

      this.setOneTimeCartTotalDiscount();
      this.setOneTimePriceAndStatus();
      this.removeInitialFromOneTimeTiers();

      this.setEveryMonthCartTotalDiscount();
      this.setEveryMonthPrice();
      this.removeInitialFromSmartshipTiers();

      this.removeCartTotalOfferIfNotMet();

      this.getPromoterProduct();
      this.getSinglePromoter();
      this.setProductSkus();
      this.setTinyUrlLink();
      this.isCartTotalOfferShown = false;
      this.isCartTotalOfferPreviouslyShown = false;

      if (
        this.oneTimeCart.length === 0 &&
        this.everyMonthCart.length === 0 &&
        this.promoterCart &&
        Object.keys(this.promoterCart).length === 0 &&
        this.promoterCart.constructor === Object &&
        this.foodDelivery?.totalItems === 0
      ) {
        this.sidebarDataService.changeCartStatus(false);
      } else {
        this.sidebarDataService.changeCartStatus(true);
      }
    }
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getLocalStorageCart() {
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;

    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: any[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : null;

    if (cartOneTime === null) {
      cartOneTime = [];
    }

    if (cartEveryMonth === null) {
      cartEveryMonth = [];
    }
    return { oneTime: cartOneTime, everyMonth: cartEveryMonth };
  }

  getCartItemPrice(value: number) {
    return this.getNumFormat(value);
  }

  getExchangedPrice(price: number) {
    let finalPrice = 0;

    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      const exchangedPrice =
        productsSettings.exchange_rate !== ''
          ? +productsSettings.exchange_rate * price
          : price;

      finalPrice =
        productsSettings.tax_rate !== '' && +productsSettings.tax_rate !== 0
          ? exchangedPrice + (exchangedPrice * +productsSettings.tax_rate) / 100
          : exchangedPrice;
    }
    return finalPrice;
  }

  getNumFormat(num: number) {
    if (
      isNaN(num) ||
      Number.POSITIVE_INFINITY === num ||
      Number.NEGATIVE_INFINITY === num
    ) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  getOneTimeNonOfferPriceAndStatus(
    discountPrice: number,
    smartshipDiscountPrice: number,
    price: number,
    oneTimeSku: string,
    cartTotalIndex: number
  ) {
    let productPrice: any;
    let productStatus: boolean;

    let cartTotalOneTimeDiscountedPrice =
      this.getCartTotalOneTimeDiscountedPrice(
        oneTimeSku,
        price,
        cartTotalIndex
      );

    let updatedDiscountPrice = 0;
    if (smartshipDiscountPrice !== 0) {
      if (this.everyMonthCart.length > 0) {
        updatedDiscountPrice =
          smartshipDiscountPrice >= discountPrice && discountPrice !== 0
            ? discountPrice
            : smartshipDiscountPrice;
      } else {
        updatedDiscountPrice = discountPrice;
      }
    } else {
      updatedDiscountPrice = discountPrice;
    }

    if (updatedDiscountPrice === 0 && cartTotalOneTimeDiscountedPrice === 0) {
      productPrice = price;
      productStatus = false;
    } else if (
      updatedDiscountPrice === 0 &&
      cartTotalOneTimeDiscountedPrice !== 0
    ) {
      const isSmartshipOnForOneTime =
        this.cartTotalOneTime[cartTotalIndex]?.settings?.smartship_discount ===
        0
          ? false
          : true;

      if (isSmartshipOnForOneTime) {
        if (this.everyMonthCart.length > 0) {
          if (
            this.cartTotalOneTime[cartTotalIndex]?.isEnabled &&
            this.cartTotalOneTime[cartTotalIndex]?.requiredPrice <= 0
          ) {
            productPrice = cartTotalOneTimeDiscountedPrice;
            productStatus = true;
          } else {
            productPrice = price;
            productStatus = false;
          }
        } else {
          productPrice = price;
          productStatus = false;
        }
      } else {
        if (
          this.cartTotalOneTime[cartTotalIndex]?.isEnabled &&
          this.cartTotalOneTime[cartTotalIndex]?.requiredPrice <= 0
        ) {
          productPrice = cartTotalOneTimeDiscountedPrice;
          productStatus = true;
        } else {
          productPrice = price;
          productStatus = false;
        }
      }
    } else if (
      updatedDiscountPrice !== 0 &&
      cartTotalOneTimeDiscountedPrice === 0
    ) {
      if (this.isSmartShipDiscount === 1) {
        if (this.everyMonthCart.length > 0) {
          productPrice = updatedDiscountPrice;
          productStatus = true;
        } else {
          productPrice = price;
          productStatus = false;
        }
      } else {
        productPrice = updatedDiscountPrice;
        productStatus = true;
      }
    } else {
      const isSmartshipOnForOneTime =
        this.cartTotalOneTime[cartTotalIndex]?.settings?.smartship_discount ===
        0
          ? false
          : true;

      const maximumDiscount =
        cartTotalOneTimeDiscountedPrice >= updatedDiscountPrice
          ? updatedDiscountPrice
          : cartTotalOneTimeDiscountedPrice;

      if (
        this.cartTotalOneTime[cartTotalIndex]?.isEnabled &&
        this.cartTotalOneTime[cartTotalIndex]?.requiredPrice <= 0
      ) {
        if (isSmartshipOnForOneTime) {
          if (this.isSmartShipDiscount === 1) {
            if (this.everyMonthCart.length > 0) {
              productPrice = maximumDiscount;
              productStatus = true;
            } else {
              productPrice = price;
              productStatus = false;
            }
          } else {
            if (this.everyMonthCart.length > 0) {
              productPrice = maximumDiscount;
              productStatus = true;
            } else {
              productPrice = updatedDiscountPrice;
              productStatus = true;
            }
          }
        } else {
          if (this.isSmartShipDiscount === 1) {
            if (this.everyMonthCart.length > 0) {
              productPrice = maximumDiscount;
              productStatus = true;
            } else {
              productPrice = cartTotalOneTimeDiscountedPrice;
              productStatus = true;
            }
          } else {
            productPrice = maximumDiscount;
            productStatus = true;
          }
        }
      } else {
        if (this.isSmartShipDiscount === 1) {
          if (this.everyMonthCart.length > 0) {
            productPrice = updatedDiscountPrice;
            productStatus = true;
          } else {
            productPrice = price;
            productStatus = false;
          }
        } else {
          productPrice = updatedDiscountPrice;
          productStatus = true;
        }
      }
    }
    return { price: productPrice, status: productStatus };
  }

  getSkuBasedOffer(
    quantity: number,
    calculatedPrice: number,
    oneTimeSku: string,
    offerProductId: number,
    status: boolean,
    oneTimePrice: number,
    offerType: string
  ) {
    let productPrice: any;
    let productStatus: boolean;

    let offerDiscount = 0;
    let currentOffer: any = {};

    let isOfferFound = false;

    if (this.productsData.hasOwnProperty('offer')) {
      this.productsData.offer.forEach((offer: any) => {
        if (offer.product.product_info.ID === offerProductId) {
          currentOffer = offer;
        }
      });

      Object.entries(currentOffer.product.discount.onetime).forEach(
        (oneTimeOffer: any[]) => {
          if (oneTimeOffer[0] === oneTimeSku) {
            offerDiscount = +oneTimeOffer[1];
          }
        }
      );

      if (offerType === 'cart_total') {
        isOfferFound = this.isCartTotalOffer(currentOffer);
      }

      if (offerType === 'sku_purchase') {
        isOfferFound = this.isSkuBaseOffer(currentOffer);
      }
    }

    if (isOfferFound && offerDiscount !== 0) {
      if (currentOffer?.include_regular_discount !== 'on') {
        productPrice = oneTimePrice - offerDiscount;
        productStatus = true;
      } else {
        productPrice = calculatedPrice - offerDiscount;
        productStatus = true;
      }
    } else {
      productPrice = calculatedPrice;
      productStatus = status;
    }

    if (productPrice < oneTimePrice) {
      productStatus = true;
    } else {
      productStatus = false;
    }

    return {
      price: this.getNumFormat(quantity * this.getExchangedPrice(productPrice)),
      status: productStatus,
    };
  }

  isSkuBaseOffer(offer: any) {
    let offerFound = false;

    if (offer.smartship) {
      let offerQualifiedFound = false;
      let offeredFound = false;

      this.everyMonthCart.forEach((cartEveryMonth: any) => {
        offer.qualify_sku.smartship.forEach((qualifiedSmartship: any) => {
          if (
            cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
          ) {
            offerQualifiedFound = true;
          }
        });
      });

      this.everyMonthCart.forEach((cartEveryMonth: any) => {
        Object.entries(offer.product.discount.smartship).forEach(
          (smartshipOffer: any[]) => {
            if (
              smartshipOffer[0] === cartEveryMonth.cart.productSku.everyMonth
            ) {
              offeredFound = true;
            }
          }
        );
      });

      if (offerQualifiedFound && offeredFound) {
        offerFound = true;
      }
    } else {
      this.oneTimeCart.forEach((cartOneTime: any) => {
        offer.qualify_sku.onetime.forEach((qualifiedOneTime: any) => {
          if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
            offerFound = true;
          }
        });
      });

      this.everyMonthCart.forEach((cartEveryMonth: any) => {
        offer.qualify_sku.smartship.forEach((qualifiedSmartship: any) => {
          if (
            cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
          ) {
            offerFound = true;
          }
        });
      });
    }

    return offerFound;
  }

  getOfferSkuFoundStatus(offer: any) {
    const offeredSkus: any[] = [];
    let offeredSkuFound = false;

    const availableVariations = Object.values(
      offer.product.product_info.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );
    availableVariations.forEach((variation: any) => {
      offeredSkus.push(variation.mvproduct_sku);
    });

    this.oneTimeCart.forEach((cartOneTime: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    this.everyMonthCart.forEach((cartEveryMonth: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  getCartTotalPrice(offer: any) {
    let cartTotalPrice = 0;

    const cartTotalOfferSkus: any[] = [];

    this.productsData.offer.forEach((offer: any) => {
      if (offer.offer_type === 'cart_total') {
        Object.entries(offer.product.discount.onetime).forEach(
          (oneTimeOffer: any[]) => {
            cartTotalOfferSkus.push(oneTimeOffer[0]);
          }
        );
      }
    });

    this.productsData.offer.forEach((offer: any) => {
      if (offer.offer_type === 'cart_total') {
        Object.entries(offer.product.discount.smartship).forEach(
          (smartshipOffer: any[]) => {
            cartTotalOfferSkus.push(smartshipOffer[0]);
          }
        );
      }
    });

    if (offer.include_regular_discount === 'on') {
      this.oneTimeCart.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          let price = 0;
          let status = false;

          for (let index = 0; index < this.cartTotalOneTime.length; index++) {
            const productPrice = this.getOneTimeNonOfferPriceAndStatus(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              element.cart.price.oneTime,
              element.cart.productSku.oneTime,
              index
            ).price;
            const productStatus = this.getOneTimeNonOfferPriceAndStatus(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              element.cart.price.oneTime,
              element.cart.productSku.oneTime,
              index
            ).status;

            if (productStatus) {
              price = productPrice;
              status = productStatus;
            }
          }

          if (!status) {
            price = this.getOneTimeNonOfferPriceAndStatus(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              element.cart.price.oneTime,
              element.cart.productSku.oneTime,
              0
            ).price;
            status = this.getOneTimeNonOfferPriceAndStatus(
              element.cart.discountPrice,
              element.cart.smartshipDiscountPrice,
              element.cart.price.oneTime,
              element.cart.productSku.oneTime,
              0
            ).status;
          }

          cartTotalPrice += element.cart.quantity * price;
        }
      });
    } else {
      this.oneTimeCart.forEach((element) => {
        if (!cartTotalOfferSkus.includes(element.cart.productSku.oneTime)) {
          cartTotalPrice += element.cart.price.oneTime * element.cart.quantity;
        }
      });
    }

    return cartTotalPrice;
  }

  isCartTotalOffer(offer: any) {
    let cartTotalOffer = false;

    let cartTotalPrice = this.getCartTotalPrice(offer);
    let totalPriceOver = +offer.price_over;

    if (cartTotalPrice >= totalPriceOver) {
      cartTotalOffer = true;
    } else {
      cartTotalOffer = false;
    }

    return cartTotalOffer;
  }

  getEveryMonthNonOfferPrice(
    OneTimePrice: number,
    everyMonthPrice: number,
    sku: string,
    cartTotalIndex: number
  ) {
    let productPrice: any;

    let cartTotalEveryMonthDiscountedPrice =
      this.getCartTotalEveryMonthDiscountedPrice(
        sku,
        OneTimePrice,
        cartTotalIndex
      );

    if (
      this.cartTotalEveryMonth[cartTotalIndex].isEnabled &&
      this.cartTotalEveryMonth[cartTotalIndex].requiredPrice <= 0 &&
      cartTotalEveryMonthDiscountedPrice !== 0
    ) {
      productPrice =
        cartTotalEveryMonthDiscountedPrice >= everyMonthPrice
          ? everyMonthPrice
          : cartTotalEveryMonthDiscountedPrice;
    } else {
      productPrice = everyMonthPrice;
    }
    return productPrice;
  }

  getCartTotalOneTimeDiscountedPrice(
    oneTimeSku: string,
    oneTimePrice: number,
    cartTotalIndex: number
  ) {
    let discountedPrice = 0;

    if (this.cartTotalOneTime.length > 0) {
      this.cartTotalOneTime[cartTotalIndex]?.discountedSkus.forEach(
        (skuObj) => {
          if (skuObj.sku === oneTimeSku) {
            discountedPrice =
              oneTimePrice - (skuObj.percent / 100) * oneTimePrice;
          }
        }
      );
    }

    return discountedPrice;
  }

  getCartTotalEveryMonthDiscountedPrice(
    everyMonthSku: string,
    oneTimePrice: number,
    cartTotalIndex: number
  ) {
    let discountedPrice = 0;

    if (this.cartTotalEveryMonth.length > 0) {
      this.cartTotalEveryMonth[cartTotalIndex]?.discountedSkus.forEach(
        (skuObj) => {
          if (skuObj.sku === everyMonthSku) {
            discountedPrice =
              oneTimePrice - (skuObj.percent / 100) * oneTimePrice;
          }
        }
      );
    }

    return discountedPrice;
  }

  onClickCartPlus(cart: string, item: any) {
    if (cart === 'OneTimeCart') {
      const oneTimeCart = this.getLocalStorageCart().oneTime;

      oneTimeCart.forEach((oneTime) => {
        if (
          this.selectedCountry.toLowerCase() === oneTime.country &&
          item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
        ) {
          if (oneTime.cart.quantity < oneTime.cart.totalQuantity) {
            oneTime.cart.quantity = oneTime.cart.quantity + 1;
          }
        }
      });
      localStorage.setItem('OneTime', JSON.stringify(oneTimeCart));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
      this.oneTimeCart = this.getOneTimeCart(oneTimeCart);
    }
    if (cart === 'EveryMonthCart') {
      const everyMonthCart = this.getLocalStorageCart().everyMonth;

      everyMonthCart.forEach((everyMonth) => {
        if (
          this.selectedCountry.toLowerCase() === everyMonth.country &&
          item.cart.productSku.everyMonth ===
            everyMonth.cart.productSku.everyMonth
        ) {
          if (everyMonth.cart.quantity < everyMonth.cart.totalQuantity) {
            everyMonth.cart.quantity = everyMonth.cart.quantity + 1;
          }
        }
      });
      localStorage.setItem('EveryMonth', JSON.stringify(everyMonthCart));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
      this.everyMonthCart = this.getEveryMonthCart(everyMonthCart);
    }

    this.setOneTimeCartTotalDiscount();
    this.setOneTimePriceAndStatus();
    this.removeInitialFromOneTimeTiers();

    this.setEveryMonthCartTotalDiscount();
    this.setEveryMonthPrice();
    this.removeInitialFromSmartshipTiers();

    this.removeCartTotalOfferIfNotMet();

    this.getPromoterProduct();
    this.getSinglePromoter();
    this.setProductSkus();
    this.setTinyUrlLink();
    this.isCartTotalOfferShown = false;
    this.isCartTotalOfferPreviouslyShown = false;
  }

  onClickCartMinus(cart: string, item: any) {
    if (item.cart.quantity === 1) {
      this.onClickCartRemove(cart, item);
    } else {
      if (cart === 'OneTimeCart') {
        const oneTimeCart = this.getLocalStorageCart().oneTime;

        oneTimeCart.forEach((oneTime) => {
          if (
            this.selectedCountry.toLowerCase() === oneTime.country &&
            item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
          ) {
            if (oneTime.cart.quantity > 1) {
              oneTime.cart.quantity = oneTime.cart.quantity - 1;
            }
          }
        });
        localStorage.setItem('OneTime', JSON.stringify(oneTimeCart));

        const currentTime = new Date().getTime();
        localStorage.setItem('CartTime', JSON.stringify(currentTime));
        this.oneTimeCart = this.getOneTimeCart(oneTimeCart);
      }
      if (cart === 'EveryMonthCart') {
        const everyMonthCart = this.getLocalStorageCart().everyMonth;

        everyMonthCart.forEach((everyMonth) => {
          if (
            this.selectedCountry.toLowerCase() === everyMonth.country &&
            item.cart.productSku.everyMonth ===
              everyMonth.cart.productSku.everyMonth
          ) {
            if (everyMonth.cart.quantity > 1) {
              everyMonth.cart.quantity = everyMonth.cart.quantity - 1;
            }
          }
        });
        localStorage.setItem('EveryMonth', JSON.stringify(everyMonthCart));

        const currentTime = new Date().getTime();
        localStorage.setItem('CartTime', JSON.stringify(currentTime));
        this.everyMonthCart = this.getEveryMonthCart(everyMonthCart);
      }

      this.setOneTimeCartTotalDiscount();
      this.setOneTimePriceAndStatus();
      this.removeInitialFromOneTimeTiers();

      this.setEveryMonthCartTotalDiscount();
      this.setEveryMonthPrice();
      this.removeInitialFromSmartshipTiers();

      this.removeCartTotalOfferIfNotMet();

      this.getPromoterProduct();
      this.getSinglePromoter();
      this.setProductSkus();
      this.setTinyUrlLink();
      this.isCartTotalOfferShown = false;
      this.isCartTotalOfferPreviouslyShown = false;
    }
  }

  onClickCartRemove(cart: string, item: any) {
    if (confirm('Are you sure you want to remove this item?')) {
      this.removeCartItem(cart, item);
    }
  }

  removeCartItem(cart: string, item: any) {
    if (cart === 'OneTimeCart') {
      const oneTimeCart = this.getLocalStorageCart().oneTime;

      const newOneTimeCart = oneTimeCart.filter(
        (oneTime) =>
          !(
            this.selectedCountry.toLowerCase() === oneTime.country &&
            item.cart.productSku.oneTime === oneTime.cart.productSku.oneTime
          )
      );
      localStorage.setItem('OneTime', JSON.stringify(newOneTimeCart));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
      this.oneTimeCart = this.getOneTimeCart(newOneTimeCart);
    } else {
      const everyMonthCart = this.getLocalStorageCart().everyMonth;

      const newEveryMonthCart = everyMonthCart.filter(
        (everyMonth) =>
          !(
            this.selectedCountry.toLowerCase() === everyMonth.country &&
            item.cart.productSku.everyMonth ===
              everyMonth.cart.productSku.everyMonth
          )
      );
      localStorage.setItem('EveryMonth', JSON.stringify(newEveryMonthCart));

      const currentTime = new Date().getTime();
      localStorage.setItem('CartTime', JSON.stringify(currentTime));
      this.everyMonthCart = this.getEveryMonthCart(newEveryMonthCart);
    }

    this.setOneTimeCartTotalDiscount();
    this.setOneTimePriceAndStatus();
    this.removeInitialFromOneTimeTiers();

    this.setEveryMonthCartTotalDiscount();
    this.setEveryMonthPrice();
    this.removeInitialFromSmartshipTiers();

    this.removeCartTotalOfferIfNotMet();

    this.getPromoterProduct();
    this.getSinglePromoter();
    this.setProductSkus();
    this.setTinyUrlLink();
    this.isCartTotalOfferShown = false;
    this.isCartTotalOfferPreviouslyShown = false;

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      this.promoterCart &&
      Object.keys(this.promoterCart).length === 0 &&
      this.promoterCart.constructor === Object &&
      this.foodDelivery?.totalItems === 0
    ) {
      this.sidebarDataService.changeCartStatus(false);
    } else {
      this.sidebarDataService.changeCartStatus(true);
    }
  }

  onClickCloseCart() {
    $('.drawer').drawer('close');
  }

  onClickFoodCheckout() {
    this.dataService.setIsCheckoutFromFoodStatus(true);

    if (this.foodDelivery.totalItems !== 0) {
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
          viUser.viCode
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

              if (autoshipFoods.length !== 0) {
                this.setFoodCheckoutUrl(
                  FoodUser.mvuser_refCode,
                  true,
                  'true',
                  ''
                );
              } else {
                this.setFoodCheckoutUrl(
                  FoodUser.mvuser_refCode,
                  false,
                  'true',
                  ''
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
  }

  setFoodCheckoutUrl(
    refCode: string,
    isAutoshipFoods: boolean,
    promptLogin: string,
    viCode: string
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
      this.selectedCountry.toLowerCase() +
      '&catalog=sunbasket' +
      '&redirect_url=' +
      this.redirectURL +
      '&language=' +
      this.selectedLanguage +
      '&gaCode=' +
      this.gaCode +
      '&fbCode=' +
      this.fbCode +
      '&googleConversionId=' +
      this.googleConversionId +
      '&googleConversionLabel=' +
      this.googleConversionLabel +
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

  onClickCheckout() {
    this.dataService.setIsCheckoutFromFoodStatus(false);

    if (
      this.oneTimeCart.length === 0 &&
      this.promoterCart &&
      Object.keys(this.promoterCart).length === 0 &&
      this.promoterCart.constructor === Object
    ) {
      this.productsDataService.changePostName('pruvit-modal-utilities');
      $('#smartshipWarningModal').modal('show');
    } else {
      let isCartTotalOfferSkuFound = false;
      const offerArray: any[] = [];

      if (this.productsData.hasOwnProperty('offer')) {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'cart_total') {
            let isCartTotalOfferFound = false;

            let cartTotalPrice = this.getCartTotalPrice(offer);
            let totalPriceOver = +offer.price_over;
            let totalPriceUnder = +offer.price_under;

            if (
              cartTotalPrice >= totalPriceOver &&
              cartTotalPrice <= totalPriceUnder
            ) {
              isCartTotalOfferFound = true;
            }

            if (isCartTotalOfferFound) {
              offerArray.push(offer);
              isCartTotalOfferSkuFound = this.getOfferSkuFoundStatus(offer);
            }
          }
        });
      }

      if (
        offerArray.length > 0 &&
        !isCartTotalOfferSkuFound &&
        !this.isCartTotalOfferShown &&
        !this.isCartTotalOfferPreviouslyShown
      ) {
        localStorage.setItem('DirectCheckout', JSON.stringify(true));

        this.isCartTotalOfferShown = true;
        this.dataService.setOfferArray(offerArray, 0);

        this.productsDataService.changePostName('pruvit-modal-utilities');
        $('#special-offer').modal('show');
      } else {
        const LocalMVUser = localStorage.getItem('MVUser');
        let MVUser = LocalMVUser ? JSON.parse(LocalMVUser) : null;

        if (
          MVUser === null ||
          (MVUser &&
            Object.keys(MVUser).length === 0 &&
            MVUser.constructor === Object)
        ) {
          this.sidebarDataService.setShortenedUrlLink('');
          this.setModals();
        } else {
          let refCode = MVUser ? MVUser.mvuser_refCode : this.refCode;

          const checkoutLink =
            this.checkoutURL +
            refCode +
            '?products=' +
            this.productSkus +
            '&country=' +
            this.selectedCountry.toLowerCase() +
            '&redirect_url=' +
            this.redirectURL +
            '&language=' +
            this.selectedLanguage +
            '&gaCode=' +
            this.gaCode +
            '&fbCode=' +
            this.fbCode +
            '&googleConversionId=' +
            this.googleConversionId +
            '&googleConversionLabel=' +
            this.googleConversionLabel +
            '&promptLogin=true';

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
      }
    }
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
      if (this.refCode !== '') {
        referrerModal = 'referrerBy';
      } else {
        referrerModal = 'referrerCode';
      }
    }

    modals.push({ modalName: referrerModal });

    this.sidebarDataService.changeCartOrCheckoutModal('checkout');
    this.dataService.changeModals(modals);
  }

  setProductSkus() {
    this.stringifiedProductSku = this.getStringifiedProductSku();

    this.productSkus = '';

    this.oneTimeCart.forEach((element, index) => {
      this.productSkus +=
        element.cart.productSku.oneTime + ':' + element.cart.quantity;
      if (this.oneTimeCart.length - 1 !== index) {
        this.productSkus += ',';
      }
    });

    if (this.oneTimeCart.length > 0 && this.everyMonthCart.length > 0) {
      this.productSkus += ',';
    }

    this.everyMonthCart.forEach((element, index) => {
      this.productSkus +=
        element.cart.productSku.everyMonth + ':' + element.cart.quantity;
      if (this.everyMonthCart.length - 1 !== index) {
        this.productSkus += ',';
      }
    });

    if (this.promoterCart.hasOwnProperty('sku')) {
      if (this.oneTimeCart.length > 0 || this.everyMonthCart.length > 0) {
        this.productSkus += ',';
      }
      this.productSkus += this.promoterCart.sku + ':' + 1;
    }

    this.sidebarDataService.changeCartSkus(this.productSkus);
  }

  getStringifiedProductSku() {
    let stringifiedProductSkus = '';

    this.oneTimeCart.forEach((element, index) => {
      stringifiedProductSkus +=
        '"' +
        element.cart.productSku.oneTime +
        '"' +
        ':' +
        element.cart.quantity;
      if (this.oneTimeCart.length - 1 !== index) {
        stringifiedProductSkus += ',';
      }
    });

    if (this.oneTimeCart.length > 0 && this.everyMonthCart.length > 0) {
      stringifiedProductSkus += ',';
    }

    this.everyMonthCart.forEach((element, index) => {
      stringifiedProductSkus +=
        '"' +
        element.cart.productSku.everyMonth +
        '"' +
        ':' +
        element.cart.quantity;
      if (this.everyMonthCart.length - 1 !== index) {
        stringifiedProductSkus += ',';
      }
    });

    if (this.promoterCart.hasOwnProperty('sku')) {
      if (this.oneTimeCart.length > 0 || this.everyMonthCart.length > 0) {
        this.productSkus += ',';
      }
      this.productSkus += '"' + this.promoterCart.sku + '":1';
    }

    return stringifiedProductSkus;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  onClickShareMyCart() {
    if (this.refCode === '') {
      const referrerLoginModal = [];
      referrerLoginModal.push({
        modalName: 'referrerCode',
      });

      this.sidebarDataService.changeCartOrCheckoutModal('shareCart');
      this.dataService.changeModals(referrerLoginModal);
    } else {
      this.sidebarDataService.setShortenedUrlLink(this.bitlyLink);

      this.productsDataService.changePostName('pruvit-modal-utilities');
      $('#shareCartModal').modal('show');
    }
  }

  onClickShopNow() {
    $('.drawer').drawer('close');

    this.utilityService.navigateToRoute(
      '/smartship',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickDeliveryRemove() {
    this.foodDelivery = {
      totalItems: 0,
      totalPrice: 0,
      appliedDiscount: 0,
    };

    localStorage.setItem('CheckoutFoods', JSON.stringify([]));

    this.store.dispatch(new SetFoodDeliveryActon(this.foodDelivery));

    localStorage.setItem('FoodDelivery', JSON.stringify(this.foodDelivery));

    if (
      this.oneTimeCart.length === 0 &&
      this.everyMonthCart.length === 0 &&
      this.promoterCart &&
      Object.keys(this.promoterCart).length === 0 &&
      this.promoterCart.constructor === Object &&
      this.foodDelivery?.totalItems === 0
    ) {
      this.sidebarDataService.changeCartStatus(false);
    } else {
      this.sidebarDataService.changeCartStatus(true);
    }
  }

  viewFoodSelections() {
    this.sidebarDataService.changeSidebarName('food-summary');
  }

  isBothPricesSame(everyMonthItem: any) {
    const discountPrice = +everyMonthItem.finalPrice;
    const originalPrice = +this.getCartItemPrice(
      everyMonthItem.cart.quantity *
        this.getExchangedPrice(everyMonthItem.cart.price.oneTime)
    );

    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
