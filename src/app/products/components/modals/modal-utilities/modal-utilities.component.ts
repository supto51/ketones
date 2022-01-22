import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { SearchPipe } from 'src/app/shared/pipes/search.pipe';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ProductsDataService } from '../../../services/products-data.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { ProductsUtilityService } from '../../../services/products-utility.service';
declare var $: any;

@Component({
  selector: 'app-modal-utilities',
  templateUrl: './modal-utilities.component.html',
  styleUrls: ['./modal-utilities.component.css'],
  providers: [SearchPipe],
})
export class ModalUtilitiesComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  production: boolean;
  pruvitTvLink = '';
  promoterCartData: any[] = [];
  bitlyLink = '';
  copyLinkText = '';
  isLinkCopied = false;
  currencySymbol = '$';
  promoterPrice = 0;
  defaultLanguage = '';
  isStaging: boolean;
  refCode = '';
  productsData: any = {};
  smartshipDiscountPercent = 0;
  smartshipProductName = '';
  offer: any = {};
  offerQuantity = 1;
  offerProduct: any = {};
  attribute1 = '';
  attribute2 = '';
  attrItem1 = '';
  attrItem2 = '';
  mvproductOrdertype = '';
  productVariation: any = {};
  servings: any[] = [];
  productOrderType: any[] = [];
  offerIndex = 0;
  offerArray: any[] = [];
  productDiscountPrice = 0;
  smartshipDiscountPrice = 0;
  billing = 'annually';
  pulseProProduct: any = {};
  pulseProVariation: any[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService,
    private sidebarDataService: SidebarDataService,
    private productsUtilityService: ProductsUtilityService,
    private appUtilityService: AppUtilityService
  ) {
    this.isStaging = environment.isStaging;
    this.production = environment.production;

    $(document).on('shown.bs.modal', '#joinAsPromoterModal', () => {
      $('body').addClass('modal-open');
    });

    $(document).on('shown.bs.modal', '#special-offer', () => {
      $('body').addClass('modal-open');
    });
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
    this.getPromoterCartData();
    this.getProducts();
    this.getPruvitTvLink();
    this.getBitlyLink();
    this.getOffer();
    this.getPulseProProduct();
  }

  getPulseProProduct() {
    this.subscriptions.push(
      this.dataService.currentPulseProProduct.subscribe((pulsePro: any) => {
        if (
          !(
            pulsePro &&
            Object.keys(pulsePro).length === 0 &&
            pulsePro.constructor === Object
          )
        ) {
          this.pulseProProduct = pulsePro;
          this.pulseProVariation = this.getPulseProVariation(
            Object.values(this.pulseProProduct.mvp_variations)
          );
        }
      })
    );
  }

  getPulseProVariation(variations: any[]) {
    const tempPulsePro: any[] = [];

    const availableVariations = variations.filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((availableVar: any) => {
      if (availableVar.mvproduct_sku.includes('CAM-2912-MXC-01')) {
        Object.entries(availableVar).forEach((varItem: any[]) => {
          tempPulsePro.push({ key: varItem[0], value: varItem[1] });
        });
      }
    });

    return tempPulsePro;
  }

  getOffer() {
    this.subscriptions.push(
      this.dataService.currentOfferArray.subscribe(
        (offerRes: { offer: any[]; index: number }) => {
          this.offerArray = offerRes.offer;
          this.offerIndex = offerRes.index;

          offerRes.offer.forEach((offer: any, i: number) => {
            if (offerRes.index === i) {
              this.offer = offer;
              this.offerQuantity = 1;
              this.offerProduct = offer.product.product_info;

              this.attribute1 = '';
              this.attribute2 = '';
              this.servings = [];
              this.productOrderType = [];
              this.mvproductOrdertype = '';
              this.productVariation = {};
              this.productDiscountPrice = 0;
              this.smartshipDiscountPrice = 0;

              this.setAttributes(this.offerProduct);
              this.getServings(this.offerProduct);
              this.getProductOrderType(this.offerProduct);
            }
          });
        }
      )
    );
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe((productsData) => {
        if (productsData) {
          this.defaultLanguage = (
            Object.values(productsData)[0] as any
          ).default_lang;

          this.productsData = productsData;
          this.getCurrencySymbolAndPromoterPrice();
        }
      })
    );
  }

  getCurrencySymbolAndPromoterPrice() {
    if (this.productsData) {
      const productsSettings = this.productsData?.product_settings;

      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';

      this.promoterPrice = +productsSettings.new_promoter_price;
    }
  }

  getBitlyLink() {
    this.sidebarDataService.currentShortenedLinkLink.subscribe((link: any) => {
      this.bitlyLink = link;
      this.translate.get('copy-link').subscribe((res: string) => {
        this.copyLinkText = res;
      });
    });
  }

  getPruvitTvLink() {
    this.subscriptions.push(
      this.dataService.currentPruvitTvLink.subscribe((link: string) => {
        if (link !== '') {
          this.pruvitTvLink = link;
        }
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

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getPromoterCartData() {
    this.subscriptions.push(
      this.sidebarDataService.currentPromoterCartData.subscribe(
        (promoterData: any[]) => {
          this.getSmartshipDiscountPercent(promoterData);

          if (promoterData) {
            this.promoterCartData = promoterData;
          }
        }
      )
    );
  }

  getSmartshipDiscountPercent(cartData: any[]) {
    if (cartData.length !== 0) {
      const maxDiscountPercent =
        cartData[0].cart.smartshipDiscountPercent >
        cartData[0].cart.discountPercent
          ? cartData[0].cart.smartshipDiscountPercent
          : cartData[0].cart.discountPercent;

      this.smartshipDiscountPercent = Math.floor(maxDiscountPercent);

      this.smartshipProductName = cartData[0].cart.productName;
    }
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

  bitlyLinkCopied(event: any) {
    if (event.isSuccess) {
      this.isLinkCopied = true;
      this.translate.get('link-copied').subscribe((res: string) => {
        this.copyLinkText = res;
      });

      setTimeout(() => {
        this.isLinkCopied = false;
        this.translate.get('copy-link').subscribe((res: string) => {
          this.copyLinkText = res;
        });
      }, 3000);
    }
  }

  onClickEmail() {
    window.location.href =
      'mailto:?subject=Share Your Cart&body=This%20is%20your%20cart.%20%0D%0A' +
      this.bitlyLink;
  }

  onClickText() {
    window.location.href =
      'sms:?&body=This%20is%20your%20cart.%20%20' + this.bitlyLink;
  }

  onClickSkip() {
    $('#joinAsPromoterModal').modal('hide');

    this.sidebarDataService.setCartData(this.promoterCartData);

    this.sidebarDataService.changeSidebarName('add-to-cart');

    const availableOffers: any[] = [];

    const cartOneTime = this.utilityService.getCurrentCart(
      this.promoterCartData
    ).oneTime;
    const cartEveryMonth = this.utilityService.getCurrentCart(
      this.promoterCartData
    ).everyMonth;

    if (this.productsData.hasOwnProperty('offer')) {
      this.productsData.offer.forEach((offer: any) => {
        if (offer.offer_type === 'cart_total') {
          const includeRegularDiscount =
            offer?.include_regular_discount === 'on' ? true : false;

          const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
            includeRegularDiscount,
            +offer.price_over,
            +offer.price_under,
            this.promoterCartData
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
                cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
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
      $('.drawer').drawer('open');
    }
  }

  onClickSubscribe() {
    $('#joinAsPromoterModal').modal('hide');

    this.sidebarDataService.setCartData(this.promoterCartData);

    this.dataService.setOfferFlowStatus(true);

    this.sidebarDataService.changeSidebarName('add-to-cart');

    this.utilityService.navigateToRoute(
      '/smartship',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickContinueToCheckout() {
    this.dataService.setIsCheckoutStatus(true);
  }

  setAttributes(product: any) {
    if (product) {
      const attributes: any[] = Object.keys(product.mvp_attributes);
      this.attribute1 = attributes[0];
      if (attributes.length > 1) {
        this.attribute2 = attributes[1];
      }
    }
  }

  getServings(product: any) {
    if (product.mvp_attributes) {
      const servings = Object.values(product.mvp_attributes);

      const tempServingsArray: any[] = [];
      servings.forEach((serving: any) => {
        const tempAttributesArray: any[] = [];

        Object.entries(serving.attribute_items.items).forEach(
          (attribute: any) => {
            if (
              attribute[1].mvproduct_attribute_item !== '' &&
              this.isAttributePresentInVariation(product, attribute[0])
            ) {
              tempAttributesArray.push({
                attrKey: attribute[0],
                attrName: attribute[1].mvproduct_attribute_item,
              });
            }
          }
        );
        tempServingsArray.push({
          servingTitle: serving.mvproduct_attribute_title,
          servingAttributes: tempAttributesArray,
        });
      });
      this.servings = tempServingsArray;

      this.selectServing(this.servings);
    }
  }

  isAttributePresentInVariation(product: any, attrKey: string) {
    let isAttrFound = false;

    const availableVariations = Object.values(product.mvp_variations).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((availableVar: any) => {
      Object.entries(availableVar).forEach((varItem: any[]) => {
        if (varItem[0] === this.attribute1) {
          if (varItem[1] === attrKey) {
            isAttrFound = true;
          }
        }
        if (this.attribute2 !== '') {
          if (varItem[0] === this.attribute2) {
            if (varItem[1] === attrKey) {
              isAttrFound = true;
            }
          }
        }
      });
    });
    return isAttrFound;
  }

  selectServing(servings: any) {
    if (servings[0].servingAttributes.length === 1) {
      this.attrItem1 = servings[0].servingAttributes[0].attrKey;
    }

    if (servings.length > 1) {
      this.attrItem2 = servings[1].servingAttributes[0].attrKey;
    }

    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  selectDelivery(productOrderType: any[]) {
    if (productOrderType.length === 1) {
      this.mvproductOrdertype = productOrderType[0].orderType;
    } else {
      if (productOrderType.length !== 0) {
        this.mvproductOrdertype = 'ordertype_3';
      }
    }

    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  onServingsSelect(event: any, servingIndex: number) {
    if (servingIndex === 0) {
      this.attrItem1 = event.target.value;
    }
    if (servingIndex === 1) {
      this.attrItem2 = event.target.value;
    }

    this.getProductOrderType(this.offerProduct);
    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  onOrderTypeSelect(event: any) {
    this.mvproductOrdertype = event.target.value;

    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  getProductOrderType(product: any) {
    let tempOrderType =
      this.productsUtilityService.getProductOrderType(product);

    let allOrderTypeForSelectedVariation = new Set<string>();

    if (Object.entries(product).length !== 0) {
      const availableVariations = Object.values(product.mvp_variations).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem: any[]) => {
          if (varItem[0] === this.attribute1) {
            if (varItem[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      allOrderTypeForSelectedVariation.add(
                        variation.mvproduct_ordertype
                      );
                    }
                  }
                });
              } else {
                allOrderTypeForSelectedVariation.add(
                  variation.mvproduct_ordertype
                );
              }
            }
          }
        });
      });
    }

    if (!allOrderTypeForSelectedVariation.has('ordertype_3')) {
      tempOrderType = tempOrderType.filter(
        (order: any) => !(order.orderType === 'ordertype_3')
      );
    }

    this.productOrderType = tempOrderType;
    this.selectDelivery(this.productOrderType);
  }

  getOrderTypePrice(orderType: string) {
    let orderTypePrice = 0;
    if (orderType === 'ordertype_3' || orderType === 'ordertype_2') {
      orderTypePrice = this.getVariationDetails('ordertype_2').variationPrice;
    } else {
      orderTypePrice = this.getVariationDetails('ordertype_1').variationPrice;
    }
    return orderTypePrice;
  }

  getVariationDetails(orderType: string) {
    let varPrice = '';
    let varSku = '';
    let productDiscount = 0;
    let smartshipDiscount = 0;

    if (Object.entries(this.offerProduct).length !== 0) {
      const availableVariations = Object.values(
        this.offerProduct.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (variation.mvproduct_ordertype === orderType) {
                        varPrice = variation.mvproduct_price;
                        varSku = variation.mvproduct_sku;

                        if (
                          variation.hasOwnProperty('mvproduct_discounted_price')
                        ) {
                          productDiscount =
                            +variation.mvproduct_discounted_price;
                        } else {
                          productDiscount = 0;
                        }

                        if (
                          variation.hasOwnProperty(
                            'mvproduct_smartship_discounted_price'
                          )
                        ) {
                          smartshipDiscount =
                            +variation.mvproduct_smartship_discounted_price;
                        } else {
                          smartshipDiscount = 0;
                        }
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === orderType) {
                  varPrice = variation.mvproduct_price;
                  varSku = variation.mvproduct_sku;

                  if (variation.hasOwnProperty('mvproduct_discounted_price')) {
                    productDiscount = +variation.mvproduct_discounted_price;
                  } else {
                    productDiscount = 0;
                  }

                  if (
                    variation.hasOwnProperty(
                      'mvproduct_smartship_discounted_price'
                    )
                  ) {
                    smartshipDiscount =
                      +variation.mvproduct_smartship_discounted_price;
                  } else {
                    smartshipDiscount = 0;
                  }
                }
              }
            }
          }
        });
      });
    }
    return {
      variationPrice: +varPrice,
      variationSku: varSku,
      discountPrice: productDiscount,
      smartshipDiscountPrice: smartshipDiscount,
    };
  }

  getTranslatedText(orderType: string) {
    let translatedText = '';
    if (orderType === 'ordertype_1') {
      this.translate.get('onetime-purchase').subscribe((res: string) => {
        translatedText = res;
      });
    }
    if (orderType === 'ordertype_2') {
      this.translate.get('subscribe-and-save').subscribe((res: string) => {
        translatedText = res;
      });
    }
    if (orderType === 'ordertype_3') {
      this.translate.get('subscribe-and-save').subscribe((res: string) => {
        translatedText = res;
      });
    }
    return translatedText;
  }

  trackByAttrKey(attr: any) {
    return attr.attrKey;
  }

  getOfferPrice(offerPrice: string) {
    if (offerPrice) {
      const priceOverStr = offerPrice.replace(/\$/g, '');
      const tempPriceOver = parseFloat(priceOverStr);

      return this.getNumFormat(
        this.getExchangedPrice(tempPriceOver) * this.offerQuantity
      );
    } else {
      return 0;
    }
  }

  getProductVariation() {
    this.productVariation = {};

    if (Object.entries(this.offerProduct).length !== 0) {
      const availableVariations = Object.values(
        this.offerProduct.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );

      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (
                        variation.mvproduct_ordertype ===
                        this.mvproductOrdertype
                      ) {
                        this.productVariation = variation;
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === this.mvproductOrdertype) {
                  this.productVariation = variation;
                }
              }
            }
          }
        });
      });
    }
  }

  getProductDiscountForVariation() {
    const productOrderType =
      this.mvproductOrdertype === 'ordertype_1'
        ? this.mvproductOrdertype
        : 'ordertype_1';

    if (Object.entries(this.offerProduct).length !== 0) {
      const availableVariations = Object.values(
        this.offerProduct.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (variation.mvproduct_ordertype === productOrderType) {
                        if (
                          variation.hasOwnProperty('mvproduct_discounted_price')
                        ) {
                          this.productDiscountPrice =
                            +variation.mvproduct_discounted_price;
                        } else {
                          this.productDiscountPrice = 0;
                        }
                        if (
                          variation.hasOwnProperty(
                            'mvproduct_smartship_discounted_price'
                          )
                        ) {
                          this.smartshipDiscountPrice =
                            +variation.mvproduct_smartship_discounted_price;
                        } else {
                          this.smartshipDiscountPrice = 0;
                        }
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === productOrderType) {
                  if (variation.hasOwnProperty('mvproduct_discounted_price')) {
                    this.productDiscountPrice =
                      +variation.mvproduct_discounted_price;
                  } else {
                    this.productDiscountPrice = 0;
                  }
                  if (
                    variation.hasOwnProperty(
                      'mvproduct_smartship_discounted_price'
                    )
                  ) {
                    this.smartshipDiscountPrice =
                      +variation.mvproduct_smartship_discounted_price;
                  } else {
                    this.smartshipDiscountPrice = 0;
                  }
                }
              }
            }
          }
        });
      });
    }
  }

  getOfferPriceAndStatus() {
    let productPrice: any;
    let productStatus: boolean;

    let isOfferFound = false;

    let offerDiscount = 0;
    let offerSku = this.getVariationDetails(
      this.mvproductOrdertype === 'ordertype_1'
        ? this.mvproductOrdertype
        : 'ordertype_2'
    ).variationSku;

    if (
      !(
        this.offer &&
        Object.keys(this.offer).length === 0 &&
        this.offer.constructor === Object
      )
    ) {
      if (this.mvproductOrdertype === 'ordertype_1') {
        Object.entries(this.offer.product.discount.onetime).forEach(
          (oneTimeOffer: any[]) => {
            if (oneTimeOffer[0] === offerSku) {
              offerDiscount = +oneTimeOffer[1];
            }
          }
        );
      } else {
        Object.entries(this.offer.product.discount.smartship).forEach(
          (smartshipOffer: any[]) => {
            if (smartshipOffer[0] === offerSku) {
              offerDiscount = +smartshipOffer[1];
            }
          }
        );
      }

      if (this.offer.offer_type === 'cart_total') {
        isOfferFound = true;
      }

      if (this.offer.offer_type === 'sku_purchase') {
        isOfferFound = this.isSkuBaseOffer(this.offer);
      }
    }

    const everyMonthCart = this.utilityService.getEveryMonthStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    const productDiscountPrice = this.getVariationDetails(
      this.mvproductOrdertype === 'ordertype_1'
        ? this.mvproductOrdertype
        : 'ordertype_2'
    ).discountPrice;

    const smartshipDiscountPrice = this.getVariationDetails(
      this.mvproductOrdertype === 'ordertype_1'
        ? this.mvproductOrdertype
        : 'ordertype_2'
    ).smartshipDiscountPrice;

    if (productDiscountPrice === 0) {
      if (smartshipDiscountPrice > 0) {
        if (everyMonthCart.length > 0) {
          productPrice = smartshipDiscountPrice;
          productStatus = true;
        } else {
          productPrice = this.getOrderTypePrice(this.mvproductOrdertype);
          productStatus = false;
        }
      } else {
        productPrice = this.getOrderTypePrice(this.mvproductOrdertype);
        productStatus = false;
      }
    } else {
      if (smartshipDiscountPrice > 0) {
        if (everyMonthCart.length > 0) {
          const maximumDiscount =
            productDiscountPrice >= smartshipDiscountPrice
              ? smartshipDiscountPrice
              : productDiscountPrice;

          productPrice = maximumDiscount;
          productStatus = true;
        } else {
          productPrice = productDiscountPrice;
          productStatus = true;
        }
      } else {
        productPrice = productDiscountPrice;
        productStatus = true;
      }
    }

    if (isOfferFound && offerDiscount !== 0) {
      const originalPrice = this.getOrderTypePrice(this.mvproductOrdertype);

      if (this.offer?.include_regular_discount !== 'on') {
        productPrice = originalPrice - offerDiscount;
        productStatus = true;
      } else {
        productPrice = productPrice - offerDiscount;
        productStatus = true;
      }
    }

    if (this.mvproductOrdertype === 'ordertype_3') {
      productStatus = true;
    }

    return {
      price: this.getNumFormat(
        this.offerQuantity * this.getExchangedPrice(productPrice)
      ),
      status: productStatus,
    };
  }

  isSkuBaseOffer(offer: any) {
    let offerFound = false;

    const oneTimeCart = this.utilityService.getOneTimeStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    const everyMonthCart = this.utilityService.getEveryMonthStorage(
      this.selectedCountry.toLowerCase(),
      this.selectedLanguage
    );

    if (offer.smartship) {
      let offerQualifiedFound = false;
      let offeredFound = false;

      everyMonthCart.forEach((cartEveryMonth: any) => {
        offer.qualify_sku.smartship.forEach((qualifiedSmartship: any) => {
          if (
            cartEveryMonth.cart.productSku.everyMonth === qualifiedSmartship
          ) {
            offerQualifiedFound = true;
          }
        });
      });

      everyMonthCart.forEach((cartEveryMonth: any) => {
        Object.entries(this.offer.product.discount.smartship).forEach(
          (smartshipOffer: any[]) => {
            if (
              smartshipOffer[0] === cartEveryMonth.cart.productSku.everyMonth
            ) {
              offeredFound = true;
            }
          }
        );
      });

      if (
        (this.mvproductOrdertype === 'ordertype_3' && offerQualifiedFound) ||
        (offerQualifiedFound && offeredFound)
      ) {
        offerFound = true;
      }
    } else {
      oneTimeCart.forEach((cartOneTime: any) => {
        offer.qualify_sku.onetime.forEach((qualifiedOneTime: any) => {
          if (cartOneTime.cart.productSku.oneTime === qualifiedOneTime) {
            offerFound = true;
          }
        });
      });

      everyMonthCart.forEach((cartEveryMonth: any) => {
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

  getServingsAndCaffeineStateName(product: any) {
    let caffeineStateName = '';
    let servingsName = '';
    if (Object.entries(product).length !== 0) {
      Object.values(product.mvp_attributes).forEach((val: any) => {
        Object.entries(val.attribute_items.items).forEach((key: any) => {
          if (key[0] === this.attrItem1) {
            servingsName = key[1].mvproduct_attribute_item;
          }
          if (key[0] === this.attrItem2) {
            caffeineStateName = key[1].mvproduct_attribute_item;
          }
        });
      });
    }
    return { servings: servingsName, caffeine: caffeineStateName };
  }

  getProductSku(productSku: string, orderType: string) {
    let skuObject = {};

    if (orderType === 'ordertype_3') {
      skuObject = {
        oneTime: this.getVariationDetails('ordertype_1').variationSku,
        everyMonth: this.getVariationDetails('ordertype_2').variationSku,
      };
    } else {
      skuObject = { oneTime: productSku };
    }
    return skuObject;
  }

  getCartPriceForVariation(orderType: string) {
    let priceObject = {};
    if (orderType === 'ordertype_3' || orderType === 'ordertype_2') {
      priceObject = {
        oneTime: this.getVariationDetails('ordertype_1').variationPrice,
        everyMonth: this.getVariationDetails('ordertype_2').variationPrice,
      };
    } else {
      priceObject = {
        oneTime: this.getVariationDetails('ordertype_1').variationPrice,
      };
    }
    return priceObject;
  }

  onClickOfferAddToOrder() {
    const cartDataWithLanguages: any[] = [];

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: this.mvproductOrdertype,
      cart: {
        productID: this.offerProduct.ID,
        productName: this.offerProduct.post_title,
        productImageUrl: this.offerProduct.post_home_thumb_url,
        servingsName: this.getServingsAndCaffeineStateName(this.offerProduct)
          .servings,
        caffeineState: this.getServingsAndCaffeineStateName(this.offerProduct)
          .caffeine,
        totalQuantity: this.productVariation.mvproduct_quantity,
        quantity: this.offerQuantity,
        price: this.getCartPriceForVariation(this.mvproductOrdertype),
        productSku: this.getProductSku(
          this.productVariation.mvproduct_sku,
          this.mvproductOrdertype
        ),
        discountPrice: this.productDiscountPrice,
        smartshipDiscountPrice: this.smartshipDiscountPrice,
        discountType: this.offer.offer_type,
      },
    });

    this.sidebarDataService.setCartData(cartDataWithLanguages);
    this.sidebarDataService.changeSidebarName('add-to-cart');

    const availableOffers: any[] = [];

    const cartOneTime = this.utilityService.getCurrentCart(
      cartDataWithLanguages
    ).oneTime;
    const cartEveryMonth = this.utilityService.getCurrentCart(
      cartDataWithLanguages
    ).everyMonth;

    if (this.productsData.hasOwnProperty('offer')) {
      this.productsData.offer.forEach((offer: any) => {
        if (offer.offer_type === 'cart_total') {
          const includeRegularDiscount =
            offer?.include_regular_discount === 'on' ? true : false;

          const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
            includeRegularDiscount,
            +offer.price_over,
            +offer.price_under,
            cartDataWithLanguages
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
      });
    }

    if (availableOffers.length > 0) {
      availableOffers.forEach((offer: any) => {
        const index = this.offerArray.findIndex(
          (existingItem: any) =>
            existingItem.offer_type === offer.offer_type &&
            offer.offer_type === 'cart_total' &&
            existingItem.price_over === offer.price_over &&
            existingItem.price_under === offer.price_under
        );

        if (index === -1) {
          this.offerArray.push(offer);
        }
      });
    }

    this.offerIndex = this.offerIndex + 1;

    if (this.offerIndex < this.offerArray.length) {
      this.dataService.setOfferArray(this.offerArray, this.offerIndex);

      this.productsDataService.changePostName('pruvit-modal-utilities');
      $('#special-offer').modal('show');
    } else {
      const LocalDirectCheckout = localStorage.getItem('DirectCheckout');
      const isDirectCheckout = LocalDirectCheckout
        ? JSON.parse(LocalDirectCheckout)
        : null;

      if (isDirectCheckout) {
        this.dataService.setIsCheckoutStatus(true);
      }
      $('.modal-backdrop').remove();

      this.sidebarDataService.changeSidebarName('checkout-cart');
      $('.drawer').drawer('open');
    }
  }

  onClickNoThanks() {
    $('body').removeClass('modal-open');

    this.offerIndex = this.offerIndex + 1;

    if (this.offerIndex < this.offerArray.length) {
      this.dataService.setOfferArray(this.offerArray, this.offerIndex);

      this.productsDataService.changePostName('pruvit-modal-utilities');
      $('#special-offer').modal('show');
    } else {
      const LocalDirectCheckout = localStorage.getItem('DirectCheckout');
      const isDirectCheckout = LocalDirectCheckout
        ? JSON.parse(LocalDirectCheckout)
        : null;

      if (isDirectCheckout) {
        this.dataService.setIsCheckoutStatus(true);
      } else {
        $('.modal-backdrop').remove();

        this.sidebarDataService.changeSidebarName('checkout-cart');
        $('.drawer').drawer('open');
      }
    }
  }

  onClickOfferMinus() {
    if (this.offerQuantity > 1) {
      this.offerQuantity--;
    }
  }

  onClickOfferPlus() {
    if (this.offerQuantity < this.productVariation.mvproduct_quantity) {
      this.offerQuantity++;
    }
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

  onBillingSelect(event: any) {
    this.billing = event.target.value;
  }

  onClickLearnMore() {
    this.sidebarDataService.changeSidebarName('delivery-options');
    $('.drawer').drawer('open');
  }

  getAttributeValue(variation: any[], searchedAttribute: string) {
    let attributeValue: any;
    if (variation.length > 0) {
      variation.forEach((attribute: any) => {
        if (attribute.key === searchedAttribute) {
          attributeValue = attribute.value;
        }
      });
    }
    return attributeValue;
  }

  getServingName(attr: any, item: any) {
    let servingName = '';

    if (this.pulseProProduct) {
      const servings = Object.entries(this.pulseProProduct.mvp_attributes);

      servings.forEach((serving: any) => {
        if (serving[0] === attr) {
          Object.entries(serving[1].attribute_items.items).forEach(
            (attribute: any) => {
              if (attribute[0] === item) {
                servingName = attribute[1].mvproduct_attribute_item;
              }
            }
          );
        }
      });
    }

    return servingName;
  }

  onClickAddToCart() {
    const isInvalidSupplement = this.appUtilityService.showPurchaseWarningPopup(
      this.selectedCountry,
      this.selectedLanguage,
      false
    );

    const cartDataWithLanguages = [];

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: 'ordertype_1',
      cart: {
        productID: this.pulseProProduct.ID,
        productName: this.pulseProProduct.post_title,
        productImageUrl: this.pulseProProduct.post_home_thumb_url,
        servingsName: this.getServingName(
          this.pulseProVariation[0].key,
          this.pulseProVariation[0].value
        ),
        caffeineState: this.getServingName(
          this.pulseProVariation[1].key,
          this.pulseProVariation[1].value
        ),
        totalQuantity: this.getAttributeValue(
          this.pulseProVariation,
          'mvproduct_quantity'
        ),
        quantity: 1,
        price: {
          oneTime: +this.getAttributeValue(
            this.pulseProVariation,
            'mvproduct_price'
          ),
        },
        discountPrice:
          +this.getAttributeValue(
            this.pulseProVariation,
            'mvproduct_discounted_price'
          ) || 0,
        productSku: {
          oneTime:
            this.billing === 'monthly'
              ? 'MEM-PUL-PRO-T1:1'
              : 'MEM-PUL-PRO-T2:1',
        },
        discountPercent:
          +this.getAttributeValue(
            this.pulseProVariation,
            'percent_of_discount'
          ) || 0,
        smartshipDiscountPrice:
          +this.getAttributeValue(
            this.pulseProVariation,
            'mvproduct_smartship_discounted_price'
          ) || 0,
        smartshipDiscountPercent:
          +this.getAttributeValue(
            this.pulseProVariation,
            'percent_of_smartship_discount'
          ) || 0,
        discountType: '',
      },
    });

    if (isInvalidSupplement) {
      this.productsDataService.changePostName('purchase-modal');
      $('#PurchaseWarningModal').modal('show');
    } else {
      if (isInvalidSupplement) {
        this.productsDataService.changePostName('purchase-modal');
        $('#PurchaseWarningModal').modal('show');
      } else {
        localStorage.setItem('DirectCheckout', JSON.stringify(false));
        this.dataService.setIsFromSmartshipStatus(false);

        if (this.selectedCountry !== 'GB' && this.selectedCountry !== 'IT') {
          cartDataWithLanguages.forEach((cartData: any) => {
            cartData.isPromoter = true;
          });
        }

        this.sidebarDataService.setCartData(cartDataWithLanguages);
        this.sidebarDataService.changeSidebarName('add-to-cart');

        this.dataService.setOfferFlowStatus(true);

        const routeURL = '/smartship';

        this.utilityService.navigateToRoute(
          routeURL,
          this.selectedCountry,
          this.selectedLanguage,
          this.isStaging,
          this.refCode,
          this.defaultLanguage
        );
      }
    }
  }

  isBothOfferPricesSame() {
    const discountPrice = +this.getOfferPriceAndStatus()?.price;
    const originalPrice = +this.getNumFormat(
      this.offerQuantity *
        this.getExchangedPrice(+this.productVariation?.mvproduct_price)
    );
    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
