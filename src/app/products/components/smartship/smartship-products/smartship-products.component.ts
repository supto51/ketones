import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { ProductsDataService } from '../../../services/products-data.service';
declare var tagSliderJS: any;
declare var $: any;

@Component({
  selector: 'app-smartship-products',
  templateUrl: './smartship-products.component.html',
  styleUrls: ['./smartship-products.component.css'],
})
export class SmartshipProductsComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  smartshipProducts: any[] = [];
  productsData: any = {};
  currencySymbol = '$';
  defaultLanguage = '';
  sortOrder = '';
  selectedCategory = '';
  categories: any[] = [];
  mostPopularSmartships: any[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getProducts();
        this.selectedCategory = '';
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
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;

            const products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );

            this.sortOrder = 'alphabetic';
            this.getCategories(productsData);
            this.getSmartshipProducts(products);
            this.getMostPopularSmartships(products);
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

  getCategories(productsData: any) {
    let categoriesData: any[] = [];
    if (productsData.hasOwnProperty('parent_category')) {
      categoriesData = Object.values(productsData.parent_category);
    }
    this.categories = categoriesData;
  }

  getMostPopularSmartships(products: any[]) {
    const tempProducts: any[] = [];
    if (products.length !== 0) {
      products.forEach((product: any) => {
        const availableVariations = Object.values(
          product.mvp_variations
        ).filter(
          (variation: any) => !(variation.mvproduct_hide_variation === 'on')
        );

        let smartshipFound = false;
        availableVariations.forEach((variation: any) => {
          if (variation.mvproduct_ordertype === 'ordertype_2') {
            smartshipFound = true;
          }
        });

        if (product.mvproduct_most_popular === 'on' && smartshipFound) {
          tempProducts.push(product);
        }
      });
    }
    this.mostPopularSmartships = tempProducts;

    $(document).ready(() => {
      if (this.mostPopularSmartships.length > 2) {
        tagSliderJS('most-popular', this.mostPopularSmartships.length);
      }
    });
  }

  getSmartshipProducts(products: any[]) {
    let tempSmartships: any[] = [];
    if (products.length !== 0) {
      products.forEach((product: any) => {
        const availableVariations = Object.values(
          product.mvp_variations
        ).filter(
          (variation: any) => !(variation.mvproduct_hide_variation === 'on')
        );

        let smartshipFound = false;
        availableVariations.forEach((variation: any) => {
          if (variation.mvproduct_ordertype === 'ordertype_2') {
            smartshipFound = true;
          }
        });

        if (smartshipFound) {
          tempSmartships.push(product);
        }
      });
    }

    this.smartshipProducts = tempSmartships;

    this.setSeo();
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

  getPriceAfterSmartshipDiscount(variations: any) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    if (variations) {
      Object.values(variations).forEach((element: any) => {
        if (element.mvproduct_ordertype === 'ordertype_2') {
          if (+element.mvproduct_price < minPrice) {
            minPrice = +element.mvproduct_price;
          }
        }
      });
    }

    return +this.getNumFormat(this.getExchangedPrice(minPrice));
  }

  getOriginalPrice(variations: any) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    if (variations) {
      Object.values(variations).forEach((element: any) => {
        if (element.mvproduct_ordertype === 'ordertype_1') {
          if (+element.mvproduct_price < minPrice) {
            minPrice = +element.mvproduct_price;
          }
        }
      });
    }

    return +this.getNumFormat(this.getExchangedPrice(minPrice));
  }

  onClickBuyNow(postName: string) {
    localStorage.setItem('DirectCheckout', JSON.stringify(false));
    this.dataService.setIsFromSmartshipStatus(true);
    this.productsDataService.changePostName(postName);
  }

  isSoldOut(product: any) {
    const isAllOutOfStock = this.checkAllAttr2OutOfStock(product);

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
    const isAllOutOfStock = this.checkAllAttr2OutOfStock(product);

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

  checkAllAttr2OutOfStock(product: any) {
    let isAllAttr1OutOfStock = true;
    if (product) {
      const availableVariations = Object.values(product.mvp_variations).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        if (variation.mvproduct_ordertype === 'ordertype_2') {
          if (variation.mvproduct_outof_stock !== 'on') {
            isAllAttr1OutOfStock = false;
          }
        }
      });
    }
    return isAllAttr1OutOfStock;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('SmartShip');
    this.seoService.updateDescription(
      'Set up a monthly SmartShip order with any of the eligible products below and get 22% OFF future monthly product orders'
    );

    this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('index,follow');
      }
    });
  }

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug === this.selectedCategory) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = categorySlug;
    }
  }

  getSpecificCategoryProducts(categories: any[]) {
    const category = categories.find((x) => x.slug === this.selectedCategory);
    return category ? category.products : [];
  }

  isBothPricesSame(product: any) {
    const discountPrice = this.getPriceAfterSmartshipDiscount(
      product.mvp_variations
    );
    const originalPrice = this.getOriginalPrice(product.mvp_variations);

    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
