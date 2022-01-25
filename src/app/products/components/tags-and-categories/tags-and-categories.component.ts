import { ActivatedRoute, Router } from '@angular/router';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ProductsDataService } from '../../services/products-data.service';
import { ProductsUtilityService } from '../../services/products-utility.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
declare var $: any;

@Component({
  selector: 'app-tags-and-categories',
  templateUrl: './tags-and-categories.component.html',
  styleUrls: ['./tags-and-categories.component.css'],
})
export class TagsAndCategoriesComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  pageName = '';
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  products: any[] = [];
  tagsOrCategories: any[] = [];
  tagsOrCategoriesProducts: any[] = [];
  inSaleProducts: any[] = [];
  outOfStockProducts: any[] = [];
  tagOrCategoryName = '';
  tagOrCategoryDescription = '';
  productsData: any = {};
  discountHeight = 0;
  parentCategory: any = {};
  isParentCategory = false;
  defaultLanguage = '';
  isStaging: boolean;
  sortOrder = '';
  tagOrCategorySlug = '';
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: AppDataService,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private router: Router,
    private translate: TranslateService,
    private renderer: Renderer2,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService,
    private seoService: AppSeoService
  ) {
    this.isStaging = environment.isStaging;

    this.setTagOrCategoryName();
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

  setTagOrCategoryName() {
    let routeUrl = window.location.pathname.split('/')[1];

    if (routeUrl === 'tag' || routeUrl === 'category') {
      if (routeUrl === 'tag') {
        this.pageName = 'tag';
      }
      if (routeUrl === 'category') {
        this.pageName = 'category';
      }
    } else {
      routeUrl = window.location.pathname.split('/')[2];

      if (routeUrl === 'tag') {
        this.pageName = 'tag';
      }
      if (routeUrl === 'category') {
        this.pageName = 'category';
      }
    }
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getCategoriesOrTags();
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
      if (refCode !== null) {
        this.refCode = refCode;
      }
    });
  }

  getCategoriesOrTags() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;

            if (this.pageName === 'tag') {
              this.tagsOrCategories = productsData.product_tag;
            }
            if (this.pageName === 'category') {
              this.tagsOrCategories = Object.values(
                productsData.parent_category
              );
            }
            this.products = productsData.list.filter(
              (item: any) => item.mvp_custom_users !== 'on'
            );
            this.getCategoryOrTag();
          }
        }
      )
    );
  }

  getParentCategory(categorySlug: string) {
    this.tagsOrCategories.forEach((category: any) => {
      if (category.slug === categorySlug) {
        this.parentCategory = category;
        this.isParentCategory = true;
      }
      if (category.hasOwnProperty('child_categories')) {
        category.child_categories.forEach((child: any) => {
          if (child.slug === categorySlug) {
            this.parentCategory = category;
          }
        });
      }
    });
  }

  getCategoryOrTag() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.parentCategory = {};
        this.isParentCategory = false;

        if (this.pageName === 'category') {
          this.getParentCategory(params['id']);
        }

        this.tagsOrCategoriesProducts = [];
        this.setRedirectURL();

        const categoryOrTag = this.productsUtilityService.getCategory(
          this.tagsOrCategories,
          params['id']
        ).category;

        this.tagOrCategorySlug = categoryOrTag.slug;
        this.tagOrCategoryName = categoryOrTag.name;
        this.tagOrCategoryDescription = categoryOrTag.description;

        const tempTagsOrCategories: any[] = [];

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            if (this.pageName === 'category') {
              const result = product.categories.some(
                (x: any) =>
                  x.term_id === categoryOrTag.term_id ||
                  x.parent === categoryOrTag.term_id
              );
              if (result) {
                tempTagsOrCategories.push(product);
              }
            }
            if (this.pageName === 'tag') {
              const result = product.tags.some(
                (x: any) => x.term_id === categoryOrTag.term_id
              );
              if (result) {
                tempTagsOrCategories.push(product);
              }
            }
          });
        }

        const isSoldOutProducts: any[] = [];
        const inSaleProducts: any[] = [];

        tempTagsOrCategories.forEach((product) => {
          if (this.isSoldOut(product)) {
            isSoldOutProducts.push(product);
          } else {
            inSaleProducts.push(product);
          }
        });

        this.outOfStockProducts = isSoldOutProducts;
        this.inSaleProducts = inSaleProducts;
        this.tagsOrCategoriesProducts = tempTagsOrCategories;

        this.sortOrder = 'alphabetic';
        this.setSeo();
      })
    );
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

  onChangeSort(event: any) {
    this.sortOrder = event.target.value;
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
      if (status) {
        if (this.tagsOrCategoriesProducts.length > 0) {
          this.seoService.updateTitle(this.tagOrCategoryName);
          this.seoService.updateDescription(this.tagOrCategoryDescription);
        } else {
          this.seoService.updateTitle('Page not found');
        }
      } else {
        if (this.tagsOrCategoriesProducts.length > 0) {
          this.seoService.updateTitle(this.tagOrCategoryName);
          this.seoService.updateDescription(this.tagOrCategoryDescription);
          this.seoService.updateRobots('index,follow');
        } else {
          this.seoService.updateTitle('Page not found');
          this.seoService.updateRobots('noindex,follow');
        }
      }
    });
  }

  onClickShopAll() {
    let shopAllSlug = '';
    const categories = Object.values(this.productsData.parent_category);

    categories.forEach((category: any) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    this.utilityService.navigateToRoute(
      '/category/' + shopAllSlug,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  isShopAllPresent(slug: string) {
    let shopAllStatus = false;

    if (slug.includes('shop-all')) {
      shopAllStatus = true;
    }

    return shopAllStatus;
  }

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
