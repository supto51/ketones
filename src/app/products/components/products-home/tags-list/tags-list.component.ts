import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
import { ProductsUtilityService } from '../../../services/products-utility.service';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.css'],
})
export class TagsListComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  productsData: any = {};
  products: any[] = [];
  refCode = '';
  tags: any[] = [];
  currencySymbol = '$';
  defaultLanguage = '';
  subscriptions: SubscriptionLike[] = [];
  isStaging: boolean;

  constructor(
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getReferrer();
    this.getSelectedCountry();
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
      })
    );
  }

  getReferrer() {
    if (this.isStaging) {
      this.subscriptions.push(
        this.route.queryParamMap.subscribe((params) => {
          const refCode = params.get('ref');
          if (refCode !== null) {
            this.refCode = refCode;
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.refCode = referrer.code;
          }
        })
      );
    }
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;
            this.products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );
            this.getTags(productsData);
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

  getTags(productsData: any) {
    let tagsData = [];
    if (productsData.hasOwnProperty('product_tag')) {
      tagsData = productsData.product_tag;

      if (tagsData.length !== 0) {
        tagsData.forEach((tag: any) => {
          if (this.products.length !== 0) {
            const tempProducts: any[] = [];
            this.products.forEach((product: any) => {
              const result = product.tags.some(
                (x: any) => x.term_id === tag.term_id
              );
              if (result) {
                tempProducts.push(product);
              }
            });
            tag.products = tempProducts;
          }
        });
      }
    }

    tagsData = tagsData.filter((tag: any) => tag.products.length !== 0);

    let orderFound = true;
    tagsData.forEach((tag: any) => {
      if (!tag.meta_data.hasOwnProperty('order')) {
        orderFound = false;
      }
    });

    if (orderFound) {
      tagsData = tagsData.sort(
        (a: any, b: any) => +a.meta_data.order[0] - +b.meta_data.order[0]
      );
    }

    tagsData.forEach((tag: any) => {
      const soldOutItems: any[] = [];
      const inSaleItems: any[] = [];

      tag.products.forEach((product: any) => {
        if (this.isSoldOut(product)) {
          soldOutItems.push(product);
        } else {
          inSaleItems.push(product);
        }
      });

      tag.products = [...inSaleItems, ...soldOutItems];
    });

    this.tags = tagsData;

    $(document).ready(() => {
      this.tags.forEach((tag: any) => {
        if (tag.products.length > 2) {
          tagSliderJS(tag.slug, tag.products.length);
        }
      });
    });
  }

  onClickTag(tagSlug: string) {
    if (tagSlug) {
      const routeURL = '/tag/' + tagSlug;
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

  isSoldOut(product: any) {
    const isAllOutOfStock = this.checkAllAttr1OutOfStock(product);

    if (product) {
      if (product.mvproduct_is_selling_closed === 'on') {
        return true;
      } else if (isAllOutOfStock) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getSoldOutText(product: any) {
    const isAllOutOfStock = this.checkAllAttr1OutOfStock(product);

    let soldOutText = '';

    if (product) {
      if (product.mvproduct_is_selling_closed === 'on') {
        if (product.mvproduct_selling_closed_text !== '') {
          soldOutText = product.mvproduct_selling_closed_text;
        } else {
          soldOutText = '';
          this.translate.get('currently-sold-out').subscribe((res: string) => {
            soldOutText = res;
          });
        }
      } else if (isAllOutOfStock) {
        soldOutText = '';
        this.translate.get('out-of-stock').subscribe((res: string) => {
          soldOutText = res;
        });
      }
    }

    return soldOutText;
  }

  checkAllAttr1OutOfStock(product: any) {
    let isAllAttr1OutOfStock = true;
    if (product) {
      const availableVariations = Object.values(product.mvp_variations).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        if (variation.mvproduct_outof_stock !== 'on') {
          isAllAttr1OutOfStock = false;
        }
      });
    }
    return isAllAttr1OutOfStock;
  }

  getProductPrice(variations: any) {
    const productDiscountPrice =
      this.productsUtilityService.getProductPrice(variations).discount;
    const productPrice =
      this.productsUtilityService.getProductPrice(variations).price;
    if (productDiscountPrice === 0) {
      return this.getNumFormat(this.getExchangedPrice(productPrice));
    } else {
      return this.getNumFormat(this.getExchangedPrice(productDiscountPrice));
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
    if (isNaN(num)) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  getProductDiscountPrice(variations: any) {
    return this.productsUtilityService.getProductPrice(variations).discount;
  }

  getProductOriginalPrice(variations: any) {
    return this.getNumFormat(
      this.getExchangedPrice(
        this.productsUtilityService.getProductPrice(variations).price
      )
    );
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);
    this.productsDataService.changePostName(postName);
  }

  onClickProductImage(postName: string) {
    if (postName) {
      const routeURL = '/product/' + postName;
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

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
