import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
import { ProductsUtilityService } from '../../../services/products-utility.service';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css'],
})
export class CategoriesListComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  products: any[] = [];
  refCode = '';
  categories: any[] = [];
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

            this.products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );
            this.getCategories(productsData);
          }
        }
      )
    );
  }

  getCategories(productsData: any) {
    let categoriesData: any[] = [];
    if (productsData.hasOwnProperty('parent_category')) {
      categoriesData = Object.values(productsData.parent_category);
    }

    const availableCategories: any[] = [];
    console.log(categoriesData);
    if (categoriesData.length > 0) {
      categoriesData.forEach((categoryItem: any) => {
        const categoryInfo = this.productsUtilityService.getCategory(
          categoriesData,
          categoryItem.slug
        ).category;

        const categoryProducts = [];

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            const result = product.categories.some(
              (x: any) =>
                x.term_id === categoryInfo.term_id ||
                x.parent === categoryInfo.term_id
            );
            if (result) {
              categoryProducts.push(product);
            }
          });
        }

        if (categoryProducts.length > 0 || categoryItem.slug === 'food') {
          availableCategories.push(categoryItem);
        }
      });
    }

    this.categories = availableCategories;
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      const routeURL = '/category/' + categorySlug;
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
