import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../services/products-data.service';
declare var $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('search') search!: ElementRef;
  searchFilter = '';
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  products: any[] = [];
  productsData: any = {};
  categories: any[] = [];
  discountHeight = 0;
  selectedCategory = '';
  defaultLanguage = '';
  isStaging: boolean;
  sortOrder = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private translate: TranslateService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private renderer: Renderer2,
    private productsDataService: ProductsDataService,
    private seoService: AppSeoService
  ) {
    this.isStaging = environment.isStaging;

    this.searchFilter = this.dataService.searchData;
    this.addKeyCodeToUrl();
    this.dataService.changeRedirectURL('search');
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
    this.getDiscountHeight();
    this.getBodyClassStatus();
    this.setSeo();
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

  getBodyClassStatus() {
    this.dataService.currentBodyHasClass.subscribe((status) => {
      if (status) {
        setTimeout(() => {
          if (this.search) {
            this.search.nativeElement.focus();
          }
        }, 0);
      }
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
        this.setRedirectURL();
      })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  getQueryParams() {
    this.route.queryParamMap.subscribe((params) => {
      const refCode = params.get('ref');
      const keyCode = params.get('key');

      if (refCode !== null) {
        this.refCode = refCode;
      }
      if (keyCode !== null) {
        this.searchFilter = keyCode;
        this.dataService.searchData = keyCode;
        this.addKeyCodeToUrl();
      }
    });
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.sortOrder = 'alphabetic';
            this.productsData = productsData;
            this.products = productsData.list.filter(
              (product: any) =>
                product.mvp_visitor === 'on' &&
                product.mvp_custom_users !== 'on'
            );
            this.getCategories(productsData);
          }
        }
      )
    );
  }

  addKeyCodeToUrl() {
    const url = this.location.path();

    if (!url.includes('key=') && this.searchFilter !== '') {
      const redirectUrl = url.includes('?')
        ? url + '&key=' + this.searchFilter
        : url + '?key=' + this.searchFilter;
      this.location.go(redirectUrl);
    }
  }

  onInput() {
    this.dataService.searchData = this.searchFilter;

    const url = this.location.path();
    let redirectUrl = this.updateQueryStringParameter(
      url,
      'key',
      this.searchFilter
    );
    if (this.searchFilter === '') {
      redirectUrl = redirectUrl.includes('&key=')
        ? redirectUrl.replace('&key=', ' ')
        : redirectUrl.replace('?key=', ' ');
    }
    this.location.go(redirectUrl);
  }

  updateQueryStringParameter(uri: string, key: string, value: string) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  getCategories(productsData: any) {
    let categoriesData: any[] = [];
    if (productsData.hasOwnProperty('parent_category')) {
      categoriesData = Object.values(productsData.parent_category);
    }
    this.categories = categoriesData;
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

  onClickCategory(categorySlug: string) {
    if (categorySlug === this.selectedCategory) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = categorySlug;
    }
  }

  onClickSearch() {
    if (this.search) {
      this.search.nativeElement.focus();
    }
  }

  getSpecificCategoryProducts(categories: any[]) {
    const category = categories.find((x) => x.slug === this.selectedCategory);
    return category ? category.products : [];
  }

  @HostListener('document:keydown', ['$event'])
  onKeySlashHandler(event: any) {
    if (event.code === 'Escape' || event.code === 'Enter') {
      this.dataService.changeBodyClassStatus(false);

      if (this.search) {
        this.search.nativeElement.blur();
      }
    }
  }

  getTranslatedSearchPruvit() {
    if (this.search) {
      this.translate.get('search-pruvit').subscribe((res: string) => {
        this.search.nativeElement.placeholder = res;
      });
    }
  }

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Search');
    this.seoService.updateDescription('');

    this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('index,follow');
      }
    });
  }

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
