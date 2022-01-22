import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FoodDelivery } from '../../foods/models/food-delivery.model';
import { AppDataService } from './app-data.service';
declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class AppUtilityService {
  constructor(
    private router: Router,
    private dataService: AppDataService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  getOneTimeStorage(country: string, language: string) {
    const LocalOneTime = localStorage.getItem('OneTime');
    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;

    if (cartOneTime === null) {
      cartOneTime = [];
    }

    const tempOneTimeCart: any[] = [];
    cartOneTime.forEach((oneTime) => {
      if (
        (oneTime.country === country &&
          oneTime.language === language &&
          oneTime.orderType === 'ordertype_1') ||
        (oneTime.country === country &&
          oneTime.language === language &&
          oneTime.orderType === 'ordertype_3')
      ) {
        tempOneTimeCart.push(oneTime);
      }
    });
    return tempOneTimeCart;
  }

  getEveryMonthStorage(country: string, language: string) {
    const LocalEveryMonth = localStorage.getItem('EveryMonth');
    let cartEveryMonth: any[] = LocalEveryMonth
      ? JSON.parse(LocalEveryMonth)
      : null;

    if (cartEveryMonth === null) {
      cartEveryMonth = [];
    }

    const tempEveryMonthCart: any[] = [];
    cartEveryMonth.forEach((everyMonth) => {
      if (
        (everyMonth.country === country &&
          everyMonth.language === language &&
          everyMonth.orderType === 'ordertype_2') ||
        (everyMonth.country === country &&
          everyMonth.language === language &&
          everyMonth.orderType === 'ordertype_3')
      ) {
        tempEveryMonthCart.push(everyMonth);
      }
    });
    return tempEveryMonthCart;
  }

  navigateToRoute(
    routeURL: string,
    selectedCountry: string,
    selectedLanguage: string,
    isStaging: boolean,
    refCode: string,
    defaultLanguage: string
  ) {
    if (selectedCountry === 'US') {
      if (selectedLanguage === defaultLanguage) {
        if (refCode === '') {
          this.router.navigate([routeURL]);
        } else {
          if (isStaging) {
            this.router.navigate([routeURL], { queryParams: { ref: refCode } });
          } else {
            this.router.navigate([routeURL]);
          }
        }
      } else {
        if (refCode === '') {
          this.router.navigate([routeURL], {
            queryParams: { lang: selectedLanguage },
          });
        } else {
          if (isStaging) {
            this.router.navigate([routeURL], {
              queryParams: { lang: selectedLanguage, ref: refCode },
            });
          } else {
            this.router.navigate([routeURL], {
              queryParams: { lang: selectedLanguage },
            });
          }
        }
      }
    } else {
      if (selectedLanguage === defaultLanguage) {
        if (refCode === '') {
          this.router.navigate([selectedCountry.toLowerCase() + routeURL]);
        } else {
          if (isStaging) {
            this.router.navigate([selectedCountry.toLowerCase() + routeURL], {
              queryParams: { ref: refCode },
            });
          } else {
            this.router.navigate([selectedCountry.toLowerCase() + routeURL]);
          }
        }
      } else {
        if (refCode === '') {
          this.router.navigate([selectedCountry.toLowerCase() + routeURL], {
            queryParams: { lang: selectedLanguage },
          });
        } else {
          if (isStaging) {
            this.router.navigate([selectedCountry.toLowerCase() + routeURL], {
              queryParams: { lang: selectedLanguage, ref: refCode },
            });
          } else {
            this.router.navigate([selectedCountry.toLowerCase() + routeURL], {
              queryParams: { lang: selectedLanguage },
            });
          }
        }
      }
    }
  }

  setRedirectURL(routerUrl: string, selectedCountry: string) {
    let redirectRoute: string = routerUrl.includes('?')
      ? routerUrl.split('?')[0]
      : routerUrl;

    if (selectedCountry !== 'US') {
      redirectRoute = redirectRoute.replace(
        '/' + selectedCountry.toLowerCase(),
        ''
      );
    }

    this.dataService.changeRedirectURL(redirectRoute);
  }

  confirmWithCloseCheckoutWidget() {
    const confirmMessage =
      'Are you sure you want to leave this page?\n\nYou will lose your progress, and any unsaved information entered so far. This action cannot be undone.';

    if (window.confirm(confirmMessage)) {
      $('#checkout__widget').modal('hide');
    }
  }

  getUrlParameter(sParam: string) {
    let sPageURL = this.document.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName: string[],
      i: number;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined
          ? true
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  }

  getOneTimePriceAndStatus(
    discountPrice: number,
    smartshipDiscountPrice: number,
    quantity: number,
    price: number,
    sku: string,
    oneTimeCartTotalDiscountedSkus: { sku: string; percent: number }[],
    everyMonthCart: any[],
    productsData: any,
    oneTimeCartTotalSettings: any,
    isOneTimeCartTotalEnabled: boolean,
    oneTimeCartTotalRequiredPrice: number,
    isSmartShipDiscount: number
  ) {
    let productPrice: any;
    let productStatus: boolean;

    let cartTotalOneTimeDiscountedPrice =
      this.getCartTotalOneTimeDiscountedPrice(
        oneTimeCartTotalDiscountedSkus,
        sku,
        price
      );

    let updatedDiscountPrice = 0;
    if (smartshipDiscountPrice !== 0) {
      if (everyMonthCart.length > 0) {
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
      productPrice = this.getNumFormat(
        quantity * this.getExchangedPrice(price, productsData)
      );
      productStatus = false;
    } else if (
      updatedDiscountPrice === 0 &&
      cartTotalOneTimeDiscountedPrice !== 0
    ) {
      const isSmartshipOnForOneTime =
        oneTimeCartTotalSettings?.smartship_discount === 0 ? false : true;

      if (isSmartshipOnForOneTime) {
        if (everyMonthCart.length > 0) {
          if (isOneTimeCartTotalEnabled && oneTimeCartTotalRequiredPrice <= 0) {
            productPrice = this.getNumFormat(
              quantity *
                this.getExchangedPrice(
                  cartTotalOneTimeDiscountedPrice,
                  productsData
                )
            );
            productStatus = true;
          } else {
            productPrice = this.getNumFormat(
              quantity * this.getExchangedPrice(price, productsData)
            );
            productStatus = false;
          }
        } else {
          productPrice = this.getNumFormat(
            quantity * this.getExchangedPrice(price, productsData)
          );
          productStatus = false;
        }
      } else {
        if (isOneTimeCartTotalEnabled && oneTimeCartTotalRequiredPrice <= 0) {
          productPrice = this.getNumFormat(
            quantity *
              this.getExchangedPrice(
                cartTotalOneTimeDiscountedPrice,
                productsData
              )
          );
          productStatus = true;
        } else {
          productPrice = this.getNumFormat(
            quantity * this.getExchangedPrice(price, productsData)
          );
          productStatus = false;
        }
      }
    } else if (
      updatedDiscountPrice !== 0 &&
      cartTotalOneTimeDiscountedPrice === 0
    ) {
      if (isSmartShipDiscount === 1) {
        if (everyMonthCart.length > 0) {
          productPrice = this.getNumFormat(
            quantity *
              this.getExchangedPrice(updatedDiscountPrice, productsData)
          );
          productStatus = true;
        } else {
          productPrice = this.getNumFormat(
            quantity * this.getExchangedPrice(price, productsData)
          );
          productStatus = false;
        }
      } else {
        productPrice = this.getNumFormat(
          quantity * this.getExchangedPrice(updatedDiscountPrice, productsData)
        );
        productStatus = true;
      }
    } else {
      const isSmartshipOnForOneTime =
        oneTimeCartTotalSettings?.smartship_discount === 0 ? false : true;

      const maximumDiscount =
        cartTotalOneTimeDiscountedPrice >= updatedDiscountPrice
          ? updatedDiscountPrice
          : cartTotalOneTimeDiscountedPrice;

      if (isOneTimeCartTotalEnabled && oneTimeCartTotalRequiredPrice <= 0) {
        if (isSmartshipOnForOneTime) {
          if (isSmartShipDiscount === 1) {
            if (everyMonthCart.length > 0) {
              productPrice = this.getNumFormat(
                quantity * this.getExchangedPrice(maximumDiscount, productsData)
              );
              productStatus = true;
            } else {
              productPrice = this.getNumFormat(
                quantity * this.getExchangedPrice(price, productsData)
              );
              productStatus = false;
            }
          } else {
            if (everyMonthCart.length > 0) {
              productPrice = this.getNumFormat(
                quantity * this.getExchangedPrice(maximumDiscount, productsData)
              );
              productStatus = true;
            } else {
              productPrice = this.getNumFormat(
                quantity *
                  this.getExchangedPrice(updatedDiscountPrice, productsData)
              );
              productStatus = true;
            }
          }
        } else {
          if (isSmartShipDiscount === 1) {
            if (everyMonthCart.length > 0) {
              productPrice = this.getNumFormat(
                quantity * this.getExchangedPrice(maximumDiscount, productsData)
              );
              productStatus = true;
            } else {
              productPrice = this.getNumFormat(
                quantity *
                  this.getExchangedPrice(
                    cartTotalOneTimeDiscountedPrice,
                    productsData
                  )
              );
              productStatus = true;
            }
          } else {
            productPrice = this.getNumFormat(
              quantity * this.getExchangedPrice(maximumDiscount, productsData)
            );
            productStatus = true;
          }
        }
      } else {
        if (isSmartShipDiscount === 1) {
          if (everyMonthCart.length > 0) {
            productPrice = this.getNumFormat(
              quantity *
                this.getExchangedPrice(updatedDiscountPrice, productsData)
            );
            productStatus = true;
          } else {
            productPrice = this.getNumFormat(
              quantity * this.getExchangedPrice(price, productsData)
            );
            productStatus = false;
          }
        } else {
          productPrice = this.getNumFormat(
            quantity *
              this.getExchangedPrice(updatedDiscountPrice, productsData)
          );
          productStatus = true;
        }
      }
    }

    return { price: productPrice, status: productStatus };
  }

  getCartTotalOneTimeDiscountedPrice(
    oneTimeCartTotalDiscountedSkus: { sku: string; percent: number }[],
    oneTimeSku: string,
    oneTimePrice: number
  ) {
    let discountedPrice = 0;

    oneTimeCartTotalDiscountedSkus.forEach((skuObj) => {
      if (skuObj.sku === oneTimeSku) {
        discountedPrice = oneTimePrice - (skuObj.percent / 100) * oneTimePrice;
      }
    });

    return discountedPrice;
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

  getExchangedPrice(price: number, productsData: any) {
    let finalPrice = 0;

    if (productsData) {
      const productsSettings = productsData.product_settings;
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

  getCartTotalInCart(
    oneTimeCart: any[],
    everyMonthCart: any[],
    includeRegularDiscount: boolean
  ) {
    let cartTotalPrice = 0;

    if (includeRegularDiscount) {
      oneTimeCart.forEach((element) => {
        let updatedDiscountPrice = 0;

        if (element.cart.smartshipDiscountPrice !== 0) {
          if (everyMonthCart.length > 0) {
            updatedDiscountPrice =
              element.cart.smartshipDiscountPrice >=
                element.cart.discountPrice && element.cart.discountPrice !== 0
                ? element.cart.discountPrice
                : element.cart.smartshipDiscountPrice;
          } else {
            updatedDiscountPrice = element.cart.discountPrice;
          }
        } else {
          updatedDiscountPrice = element.cart.discountPrice;
        }

        if (updatedDiscountPrice === 0) {
          updatedDiscountPrice = element.cart.price.oneTime;
        }

        cartTotalPrice += updatedDiscountPrice * element.cart.quantity;
      });
    } else {
      oneTimeCart.forEach((element) => {
        cartTotalPrice += element.cart.price.oneTime * element.cart.quantity;
      });
    }

    return cartTotalPrice;
  }

  isCartTotalOffer(
    includeRegularDiscount: boolean,
    totalPriceOver: number,
    totalPriceUnder: number,
    currentCarts: any[],
    currentCountry?: string,
    currentLanguage?: string
  ) {
    let cartTotalOffer = false;

    let oneTimeCart = [];
    let everyMonthCart = [];

    if (currentCarts.length === 0 && currentCountry && currentLanguage) {
      oneTimeCart = this.getOneTimeStorage(currentCountry, currentLanguage);
      everyMonthCart = this.getEveryMonthStorage(
        currentCountry,
        currentLanguage
      );
    } else {
      oneTimeCart = this.getCurrentCart(currentCarts).oneTime;
      everyMonthCart = this.getCurrentCart(currentCarts).everyMonth;
    }

    const newCartTotal = this.getCartTotalInCart(
      oneTimeCart,
      everyMonthCart,
      includeRegularDiscount
    );

    if (newCartTotal >= totalPriceOver && newCartTotal <= totalPriceUnder) {
      cartTotalOffer = true;
    } else {
      cartTotalOffer = false;
    }

    return cartTotalOffer;
  }

  getCurrentCart(currentCarts: any[]) {
    const LocalOneTime = localStorage.getItem('OneTime');
    const LocalEveryMonth = localStorage.getItem('EveryMonth');

    let cartOneTime: any[] = LocalOneTime ? JSON.parse(LocalOneTime) : null;
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
          const cartOneTimeIndex = cartOneTime.findIndex((oneTime: any) => {
            return (
              (currentCart.cart.caffeineState === '' &&
                currentCart.country === oneTime.country &&
                currentCart.language === oneTime.language &&
                oneTime.cart.productID === currentCart.cart.productID &&
                oneTime.cart.servingsName === currentCart.cart.servingsName) ||
              (currentCart.cart.caffeineState !== '' &&
                currentCart.country === oneTime.country &&
                currentCart.language === oneTime.language &&
                oneTime.cart.productID === currentCart.cart.productID &&
                oneTime.cart.servingsName === currentCart.cart.servingsName &&
                oneTime.cart.caffeineState === currentCart.cart.caffeineState)
            );
          });
          if (cartOneTimeIndex !== -1) {
            cartOneTime[cartOneTimeIndex].cart.quantity =
              currentCart.cart.quantity;
            cartOneTime[cartOneTimeIndex].cart.price = currentCart.cart.price;
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
                  everyMonth.cart.productID === currentCart.cart.productID &&
                  everyMonth.cart.servingsName ===
                    currentCart.cart.servingsName) ||
                (currentCart.cart.caffeineState !== '' &&
                  currentCart.country === everyMonth.country &&
                  currentCart.language === everyMonth.language &&
                  everyMonth.cart.productID === currentCart.cart.productID &&
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

    return { oneTime: cartOneTime, everyMonth: cartEveryMonth };
  }

  showPurchaseWarningPopup(
    selectedCountry: string,
    selectedLanguage: string,
    fromFood: boolean
  ) {
    const oneTimeCart = this.getOneTimeStorage(
      selectedCountry.toLowerCase(),
      selectedLanguage
    );

    const everyMonthCart = this.getEveryMonthStorage(
      selectedCountry.toLowerCase(),
      selectedLanguage
    );

    const LocalPromoter = localStorage.getItem('Promoter');
    const promoterData = LocalPromoter ? JSON.parse(LocalPromoter) : null;

    let promoterFound = false;
    if (promoterData !== null) {
      this.dataService.setPromoterData(promoterData);

      promoterFound = promoterData.some(
        (promoter: any) =>
          promoter.country === selectedCountry &&
          promoter.language === selectedLanguage
      );
    }

    const LocalFoodDelivery = localStorage.getItem('FoodDelivery');
    let FoodDeliveryInfo: FoodDelivery = LocalFoodDelivery
      ? JSON.parse(LocalFoodDelivery)
      : null;

    if (!FoodDeliveryInfo) {
      FoodDeliveryInfo = {
        totalItems: 0,
        totalPrice: 0,
        appliedDiscount: 0,
      } as FoodDelivery;
    }

    if (fromFood) {
      return (
        oneTimeCart.length !== 0 || everyMonthCart.length !== 0 || promoterFound
      );
    } else {
      return FoodDeliveryInfo.totalItems !== 0;
    }
  }
}
