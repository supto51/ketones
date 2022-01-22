import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { ProductsUtilityService } from 'src/app/products/services/products-utility.service';
import { SidebarDataService } from '../../services/sidebar-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
declare var $: any;

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.css'],
})
export class AddToCartComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  products = [];
  product: any = {};
  cartData: any = {};
  productName = '';
  currencySymbol = '$';
  productsData: any = {};
  isFromSmartship = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private sidebarDataService: SidebarDataService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService,
    private utilityService: AppUtilityService
  ) {}

  ngOnInit() {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getCurrentCartData();
    this.getPromoterText();
    this.getProducts();
    this.setCarts();
    this.getIsFromSmartshipStatus();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('.drawer').drawer('softRefresh');
    }, 0);
  }

  getIsFromSmartshipStatus() {
    this.subscriptions.push(
      this.dataService.currentIsFromSmartship.subscribe((status: boolean) => {
        this.isFromSmartship = status;
      })
    );
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.productsData = productsData;
            this.products = productsData.list;
            this.getCurrencySymbol();
          }
        }
      )
    );
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

  getProduct(cartData: any) {
    let tempProduct = {};
    if (this.products.length !== 0) {
      this.products.forEach((product: any) => {
        if (product.ID === cartData.productID) {
          tempProduct = product;
        }
      });
    }
    return tempProduct;
  }

  getPromoterText() {
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
              let translatedText = '';
              this.translate.get('added-cart').subscribe((res: string) => {
                translatedText = res;
              });

              this.productName = 'Promoter membership fee ' + translatedText;
            }
          }
        );
      }
    });
  }

  getCurrentCartData() {
    this.subscriptions.push(
      this.sidebarDataService.currentCartData.subscribe((data: any[]) => {
        if (data.length !== 0) {
          data.forEach((element: any) => {
            if (element.language === this.selectedLanguage) {
              let translatedText = '';
              this.translate.get('added-cart').subscribe((res: string) => {
                translatedText = res;
              });

              this.cartData = element.cart;
              this.productName =
                this.cartData.productName + ' ' + translatedText;
            }
          });
        }
      })
    );
  }

  getSmartshipTranslatedText() {
    let translatedText = '';
    this.translate
      .get('was-added-to-your-smartship')
      .subscribe((res: string) => {
        translatedText = res;
      });

    return this.cartData.productName + ' ' + translatedText;
  }

  setCarts() {
    this.subscriptions.push(
      this.sidebarDataService.currentCartData.subscribe(
        (currentCarts: any[]) => {
          if (currentCarts.length !== 0) {
            const LocalOneTime = localStorage.getItem('OneTime');
            let cartOneTime: any[] = LocalOneTime
              ? JSON.parse(LocalOneTime)
              : null;

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

            if (
              currentCarts[0].orderType === 'ordertype_1' ||
              currentCarts[0].orderType === 'ordertype_3'
            ) {
              if (cartOneTime.length !== 0) {
                currentCarts.forEach((currentCart: any) => {
                  const cartOneTimeIndex = cartOneTime.findIndex(
                    (oneTime: any) => {
                      return (
                        (currentCart.cart.caffeineState === '' &&
                          currentCart.country === oneTime.country &&
                          currentCart.language === oneTime.language &&
                          oneTime.cart.productID ===
                            currentCart.cart.productID &&
                          oneTime.cart.servingsName ===
                            currentCart.cart.servingsName) ||
                        (currentCart.cart.caffeineState !== '' &&
                          currentCart.country === oneTime.country &&
                          currentCart.language === oneTime.language &&
                          oneTime.cart.productID ===
                            currentCart.cart.productID &&
                          oneTime.cart.servingsName ===
                            currentCart.cart.servingsName &&
                          oneTime.cart.caffeineState ===
                            currentCart.cart.caffeineState)
                      );
                    }
                  );
                  if (cartOneTimeIndex !== -1) {
                    cartOneTime[cartOneTimeIndex].cart.quantity =
                      currentCart.cart.quantity;
                    cartOneTime[cartOneTimeIndex].cart.price =
                      currentCart.cart.price;
                    cartOneTime[cartOneTimeIndex].cart.productSku =
                      currentCart.cart.productSku;
                  } else {
                    cartOneTime.push(currentCart);
                  }
                });
              } else {
                currentCarts.forEach((element: any) => {
                  cartOneTime.push(element);
                });
              }
            }

            if (
              currentCarts[0].orderType === 'ordertype_2' ||
              currentCarts[0].orderType === 'ordertype_3'
            ) {
              if (cartEveryMonth.length !== 0) {
                currentCarts.forEach((currentCart: any) => {
                  const cartEveryMonthIndex = cartEveryMonth.findIndex(
                    (everyMonth: any) => {
                      return (
                        (currentCart.cart.caffeineState === '' &&
                          currentCart.country === everyMonth.country &&
                          currentCart.language === everyMonth.language &&
                          everyMonth.cart.productID ===
                            currentCart.cart.productID &&
                          everyMonth.cart.servingsName ===
                            currentCart.cart.servingsName) ||
                        (currentCart.cart.caffeineState !== '' &&
                          currentCart.country === everyMonth.country &&
                          currentCart.language === everyMonth.language &&
                          everyMonth.cart.productID ===
                            currentCart.cart.productID &&
                          everyMonth.cart.servingsName ===
                            currentCart.cart.servingsName &&
                          everyMonth.cart.caffeineState ===
                            currentCart.cart.caffeineState)
                      );
                    }
                  );
                  if (cartEveryMonthIndex !== -1) {
                    cartEveryMonth[cartEveryMonthIndex].cart.quantity =
                      currentCart.cart.quantity;
                    cartEveryMonth[cartEveryMonthIndex].cart.price =
                      currentCart.cart.price;
                    cartEveryMonth[cartEveryMonthIndex].cart.productSku =
                      currentCart.cart.productSku;
                  } else {
                    cartEveryMonth.push(currentCart);
                  }
                });
              } else {
                currentCarts.forEach((element: any) => {
                  cartEveryMonth.push(element);
                });
              }
            }

            const tempOneTimeCart = [];
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

            const tempEveryMonthCart = [];
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

            if (
              tempOneTimeCart.length === 0 &&
              tempEveryMonthCart.length === 0
            ) {
              this.sidebarDataService.changeCartStatus(false);
            } else {
              this.sidebarDataService.changeCartStatus(true);
            }

            localStorage.setItem('OneTime', JSON.stringify(cartOneTime));
            localStorage.setItem('EveryMonth', JSON.stringify(cartEveryMonth));

            const currentTime = new Date().getTime();
            localStorage.setItem('CartTime', JSON.stringify(currentTime));
          }
        }
      )
    );
  }

  getRelatedProducts() {
    const relatedProducts: any[] = [];
    this.product = this.getProduct(this.cartData);
    if (this.product.mvproduct_related_products) {
      this.product.mvproduct_related_products.forEach((productID: string) => {
        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            if (product.ID === +productID) {
              relatedProducts.push(product);
            }
          });
        }
      });
    }
    return relatedProducts;
  }

  getProductPrice(variations: any) {
    const productPrice =
      this.productsUtilityService.getProductPrice(variations).price;
    return this.getNumFormat(this.getExchangedPrice(productPrice));
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
    if (isNaN(num)) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  onClickCloseAddToCart() {
    $('.drawer').drawer('close');
    this.sidebarDataService.changeSidebarName('');
  }

  onClickGoToCart() {
    if (this.isFromSmartship) {
      const availableOffers: any[] = [];

      const cartOneTime = this.utilityService.getOneTimeStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      const cartEveryMonth = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      if (this.productsData.hasOwnProperty('offer')) {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'cart_total') {
            const includeRegularDiscount =
              offer?.include_regular_discount === 'on' ? true : false;

            const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
              includeRegularDiscount,
              +offer.price_over,
              +offer.price_under,
              [],
              this.selectedCountry.toLowerCase(),
              this.selectedLanguage
            );

            const isOfferSkuFound = this.getOfferSkuFoundStatus(
              offer,
              cartOneTime,
              cartEveryMonth
            );

            if (cartTotalOfferFound && !isOfferSkuFound) {
              availableOffers.push(offer);
            }
          }
          if (offer.offer_type === 'sku_purchase') {
            let skuBasedOfferFound = false;

            cartOneTime.forEach((cartOneTime: any) => {
              offer.qualify_sku.onetime.forEach((qualifiedOneTime: any) => {
                if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
                  skuBasedOfferFound = true;
                }
              });
            });

            cartEveryMonth.forEach((cartEveryMonth: any) => {
              offer.qualify_sku.smartship.forEach((qualifiedSmartship: any) => {
                if (
                  cartEveryMonth.cart.productSku.everyMonth ===
                  qualifiedSmartship
                ) {
                  skuBasedOfferFound = true;
                }
              });
            });

            const isOfferSkuFound = this.getOfferSkuFoundStatus(
              offer,
              cartOneTime,
              cartEveryMonth
            );

            if (skuBasedOfferFound && !isOfferSkuFound) {
              availableOffers.push(offer);
            }
          }
        });
      }

      if (availableOffers.length > 0) {
        this.dataService.setOfferArray(availableOffers, 0);

        this.productsDataService.changePostName('pruvit-modal-utilities');
        $('#special-offer').modal('show');
      } else {
        this.sidebarDataService.changeSidebarName('checkout-cart');
      }
    } else {
      this.sidebarDataService.changeSidebarName('checkout-cart');
    }
  }

  onClickBuyNow(postName: string) {
    this.productsDataService.changePostName(postName);
    $('.drawer').drawer('close');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    $('.drawer').drawer('close');
  }

  getOfferSkuFoundStatus(
    offer: any,
    oneTimeCart: any[],
    everyMonthCart: any[]
  ) {
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

    oneTimeCart.forEach((cartOneTime: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    everyMonthCart.forEach((cartEveryMonth: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
