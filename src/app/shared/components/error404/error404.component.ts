import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.css'],
})
export class Error404Component implements OnInit, AfterViewInit, OnDestroy {
  searchFilter = '';
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  products = [];
  isInputFocused = false;
  defaultLanguage = '';
  isStaging: boolean;
  productsData: any = {};
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
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

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getDefaultLanguage();
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

  getDefaultLanguage() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;
          }
        }
      )
    );
  }

  onClickShopKetone() {
    let shopAllSlug = '';
    const categories = Object.values(this.productsData.parent_category);

    categories.forEach((category: any) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    const routeURL = '/category/' + shopAllSlug;

    this.utilityService.navigateToRoute(
      routeURL,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
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

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
