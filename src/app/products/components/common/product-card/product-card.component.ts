import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
import { ProductsUtilityService } from '../../../services/products-utility.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product = {} as any;
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  productsData: any = {};
  currencySymbol = '$';
  defaultLanguage = '';
  isStaging: boolean;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
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

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;
            this.productsData = productsData;

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

  onClickProductImage(postName: any) {
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

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(false);
    this.productsDataService.changePostName(postName);
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

  isBothPricesSame() {
    const discountPrice = +this.getProductPrice(this.product.mvp_variations);
    const originalPrice = +this.getProductOriginalPrice(
      this.product.mvp_variations
    );

    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
