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
import { ProductsDataService } from '../../services/products-data.service';
import { ProductsUtilityService } from '../../services/products-utility.service';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-promoter',
  templateUrl: './promoter.component.html',
  styleUrls: ['./promoter.component.css'],
})
export class PromoterComponent implements OnInit, AfterViewInit, OnDestroy {
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  isStaging: boolean;
  refCode = '';
  productsData: any = {};
  promoters: any[] = [];
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
    private sidebarDataService: SidebarDataService,
    private productsUtilityService: ProductsUtilityService,
    private appUtilityService: AppUtilityService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
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
    this.renderer.removeClass(document.body, 'body-gray');
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
            this.getPromoters(products);
          }
        }
      )
    );
  }

  getPromoterBenefits(bannerDescription: string) {
    return bannerDescription.includes('<br>')
      ? bannerDescription.split('<br>')
      : bannerDescription.split(',');
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

  getPromoters(products: any[]) {
    const tempPromoters: any[] = [];
    if (products.length !== 0) {
      products.forEach((product: any) => {
        if (product.mvproduct_forpromoter === 'on') {
          tempPromoters.push(product);
        }
      });
    }

    const sortedPromoters = tempPromoters.sort(
      (a: any, b: any) => +b.mvproduct_promoter_seq - +a.mvproduct_promoter_seq
    );

    this.promoters = sortedPromoters;

    $(document).ready(() => {
      tooltipJS();
    });
  }

  isPromoterMini(promoter: any) {
    if (promoter) {
      if (
        promoter.post_title.includes('mini') ||
        promoter.post_name.includes('mini')
      ) {
        return true;
      }
    }
    return false;
  }

  getPromoterStartingPrice(promoter: any) {
    if (promoter) {
      const availableVariations = Object.values(promoter.mvp_variations).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      const discountedPrice =
        this.productsUtilityService.getProductPrice(
          availableVariations
        ).discount;
      const originalPrice =
        this.productsUtilityService.getProductPrice(availableVariations).price;

      return discountedPrice !== 0
        ? this.getNumFormat(this.getExchangedPrice(discountedPrice))
        : this.getNumFormat(this.getExchangedPrice(originalPrice));
    } else {
      return 0;
    }
  }

  getPromoterFee() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;

      return this.getNumFormat(
        this.getExchangedPrice(+productsSettings.new_promoter_price)
      );
    } else {
      return 0;
    }
  }

  isMostPopular(promoter: any) {
    if (promoter) {
      if (promoter.mvproduct_most_popular === 'on') {
        return true;
      }
    }
    return false;
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

  onClickPromoter(postSlug: string) {
    const routeURL = '/promoter/' + postSlug;

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickPromoterFee() {
    const isInvalidSupplement = this.appUtilityService.showPurchaseWarningPopup(
      this.selectedCountry,
      this.selectedLanguage,
      false
    );

    if (isInvalidSupplement) {
      this.productsDataService.changePostName('purchase-modal');
      $('#PurchaseWarningModal').modal('show');
    } else {
      const productsSettings = this.productsData.product_settings;

      const promoter = {
        country: this.selectedCountry,
        language: this.selectedLanguage,
        sku: productsSettings.new_promoter_sku,
        price: +productsSettings.new_promoter_price,
      };

      let currentPromoterData = this.dataService.promoterData.value;

      const found = currentPromoterData.some(
        (promoter) =>
          promoter.country === this.selectedCountry &&
          promoter.language === this.selectedLanguage
      );
      if (!found) currentPromoterData.push(promoter);

      setTimeout(() => {
        this.dataService.setPromoterData(currentPromoterData);
        this.sidebarDataService.changeCartStatus(true);
      }, 0);

      localStorage.setItem('Promoter', JSON.stringify(currentPromoterData));

      this.sidebarDataService.setCartData([]);
      this.sidebarDataService.changeSidebarName('add-to-cart');
      $('.drawer').drawer('open');
    }
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

  get isAsianMarkets() {
    if (
      this.selectedCountry === 'HK' ||
      this.selectedCountry === 'MO' ||
      this.selectedCountry === 'MY' ||
      this.selectedCountry === 'SG'
    ) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
