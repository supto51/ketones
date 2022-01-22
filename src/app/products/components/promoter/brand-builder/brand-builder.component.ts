import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-brand-builder',
  templateUrl: './brand-builder.component.html',
  styleUrls: ['./brand-builder.component.css'],
})
export class BrandBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  isStaging: boolean;
  refCode = '';
  packs: any[] = [];
  product: any = {};
  productsData: any = {};
  currencySymbol = '$';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private sidebarDataService: SidebarDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  ngAfterViewInit() {
    $(document).ready(() => {
      $('.drawer').drawer({
        iscroll: {
          mouseWheel: true,
          scrollbars: true,
          bounce: false,
        },
      });
    });
  }

  getDiscountHeight() {
    const bodyClasses =
      document.getElementById('body-element')?.classList.value;

    if (bodyClasses && !bodyClasses.includes('body-gray')) {
      this.renderer.addClass(document.body, 'body-gray');
    }

    this.renderer.removeClass(document.body, 'extr-padd-btm');

    this.dataService.currentDiscountHeight.subscribe((height: number) => {
      this.discountHeight = height;
    });
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getProducts();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;
            this.productsData = productsData;
            const products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );

            this.getCurrencySymbol();
            this.getProduct(products);
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

  getProduct(products: any[]) {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        this.product = {};

        if (products.length !== 0) {
          products.forEach((product: any) => {
            if (product.post_name === params['id']) {
              this.product = product;

              this.packs = this.getpacks(
                Object.values(this.product.mvp_variations)
              );

              this.loadTooltip();
            }
          });
        }
      })
    );
  }

  getpacks(variations: any[]) {
    const tempVariations: any[] = [];

    const availableVariations = variations.filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((availableVar: any) => {
      const tempAttributes: any[] = [];

      Object.entries(availableVar).forEach((varItem: any[]) => {
        tempAttributes.push({ key: varItem[0], value: varItem[1] });
      });

      tempVariations.push(tempAttributes);
    });

    return tempVariations;
  }

  getServingName(attr: any, item: any) {
    let servingName = '';

    if (this.product) {
      const servings = Object.entries(this.product.mvp_attributes);

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

  getOriginalPrice(variation: any[]) {
    let price = 0;

    variation.forEach((item: { key: string; value: string }) => {
      if (item.key === 'mvproduct_price') {
        price = +item.value;
      }
    });

    return +this.getNumFormat(this.getExchangedPrice(price));
  }

  getDiscountPrice(variation: any[]) {
    let calculatedPrice = 0;
    let discountPrice = 0;
    let smartshipDiscountPrice = 0;

    variation.forEach((item: { key: string; value: string }) => {
      if (item.key === 'mvproduct_discounted_price') {
        discountPrice = +item.value;
      }
      if (item.key === 'mvproduct_smartship_discounted_price') {
        smartshipDiscountPrice = +item.value;
      }
    });

    if (discountPrice !== 0) {
      if (smartshipDiscountPrice !== 0) {
        calculatedPrice =
          discountPrice > smartshipDiscountPrice
            ? smartshipDiscountPrice
            : discountPrice;
      } else {
        calculatedPrice = discountPrice;
      }
    } else {
      if (smartshipDiscountPrice !== 0) {
        calculatedPrice = smartshipDiscountPrice;
      } else {
        calculatedPrice = discountPrice;
      }
    }

    return +this.getNumFormat(this.getExchangedPrice(calculatedPrice));
  }

  getVariationImage(variation: any[]) {
    let imageUrl =
      this.getAttributeValue(variation, 'mvproduct_variation_image') || '';

    return imageUrl;
  }

  onClickBuyNow(variation: any[]) {
    const variationSku = this.getAttributeValue(variation, 'mvproduct_sku');

    if (variationSku.includes('CAM-2912-MXC-01')) {
      this.dataService.setPulseProProduct(this.product);

      this.productsDataService.changePostName('pruvit-modal-utilities');
      $('#pulse-pro').modal('show');
    } else {
      const cartDataWithLanguages = [];

      cartDataWithLanguages.push({
        country: this.selectedCountry.toLowerCase(),
        language: this.selectedLanguage,
        orderType: 'ordertype_1',
        cart: {
          productID: this.product.ID,
          productName: this.product.post_title,
          productImageUrl: this.product.post_home_thumb_url,
          servingsName: this.getServingName(
            variation[0].key,
            variation[0].value
          ),
          caffeineState: this.getServingName(
            variation[1].key,
            variation[1].value
          ),
          totalQuantity: this.getAttributeValue(
            variation,
            'mvproduct_quantity'
          ),
          quantity: 1,
          price: {
            oneTime: +this.getAttributeValue(variation, 'mvproduct_price'),
          },
          discountPrice:
            +this.getAttributeValue(variation, 'mvproduct_discounted_price') ||
            0,
          productSku: {
            oneTime: this.getAttributeValue(variation, 'mvproduct_sku'),
          },
          discountPercent:
            +this.getAttributeValue(variation, 'percent_of_discount') || 0,
          smartshipDiscountPrice:
            +this.getAttributeValue(
              variation,
              'mvproduct_smartship_discounted_price'
            ) || 0,
          smartshipDiscountPercent:
            +this.getAttributeValue(
              variation,
              'percent_of_smartship_discount'
            ) || 0,
          discountType: '',
        },
      });

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

  onClickHome() {
    this.utilityService.navigateToRoute(
      '/',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickPromoter() {
    this.utilityService.navigateToRoute(
      '/promoter',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  getTooltipPlacement() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      return 'bottom';
    } else {
      return 'right';
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
