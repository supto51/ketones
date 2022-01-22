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
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../products/services/products-data.service';
import { AppDataService } from '../shared/services/app-data.service';
import { AppUtilityService } from '../shared/services/app-utility.service';
import { IngredientApiService } from './services/ingredient-api.service';
import { IngredientService } from './services/ingredient.service';
declare var $: any;

@Component({
  selector: 'app-ingredient',
  templateUrl: './ingredient.component.html',
  styleUrls: ['./ingredient.component.css'],
  providers: [IngredientService],
})
export class IngredientComponent implements OnInit, AfterViewInit, OnDestroy {
  discountHeight = 0;
  selectedLanguage = '';
  selectedCountry = '';
  defaultLanguage = '';
  isStaging: boolean;
  refCode = '';
  productsData: any = {};
  ingredientCategories: any[] = [];
  ingredientProducts: any[] = [];
  ingredientProduct: any = {};
  ingredientChargedState = '';
  selectedCategorySlug = '';
  selectedProductSlug = '';
  products = [];
  categories = [];

  servingSize = '';
  ingredientServings: any[] = [];
  ingredients: any[] = [];
  supplements: any[] = [];
  disclaimers: any[] = [];
  currencySymbol = '$';
  subscriptions: SubscriptionLike[] = [];
  isLoaded = false;

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private translate: TranslateService,
    private productsDataService: ProductsDataService,
    private utilityService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,
    private ingredientApiService: IngredientApiService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getDiscountHeight();
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

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
        this.setRedirectURL();

        this.getSelectedLanguage();
      })
    );
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
            this.getCurrencySymbol();

            this.getAllIngredients();
          }
        }
      )
    );
  }

  getAllIngredients() {
    this.subscriptions.push(
      this.ingredientApiService
        .getIngredients(
          this.selectedCountry,
          this.selectedLanguage,
          this.defaultLanguage
        )
        .subscribe((ingredientsData: any) => {
          this.isLoaded = true;
          this.products = ingredientsData.list ? ingredientsData.list : [];
          this.categories = ingredientsData.categories
            ? ingredientsData.categories
            : [];

          this.setInitialIngredients();
          this.getIngredientCategories();
        })
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

  setInitialIngredients() {
    let ingredientUrl = this.router.url.includes('?')
      ? this.router.url.split('?')[0]
      : this.router.url;

    if (this.selectedCountry === 'US') {
      ingredientUrl = ingredientUrl.replace('/ingredients/', '');
    } else {
      ingredientUrl = ingredientUrl.replace(
        '/' + this.selectedCountry.toLowerCase() + '/ingredients/',
        ''
      );
    }

    let categorySlug = ingredientUrl.split('/')[0]
      ? ingredientUrl.split('/')[0]
      : '';
    let productSlug = ingredientUrl.split('/')[1]
      ? ingredientUrl.split('/')[1]
      : '';

    let servingName = ingredientUrl.split('/')[2]
      ? ingredientUrl.replace(categorySlug + '/' + productSlug + '/', '')
      : '';

    servingName = servingName.substr(0, servingName.length - 1);
    servingName = decodeURIComponent(servingName);

    this.selectedCategorySlug = categorySlug;
    this.ingredientProducts = this.getIngredientProducts(
      this.selectedCategorySlug
    );

    this.selectedProductSlug = productSlug;
    this.getIngredientServings(this.selectedProductSlug);

    this.ingredientChargedState = servingName;
    this.getIngredients(this.ingredientProduct);
    this.getSupplements(this.ingredientProduct);
    this.getDisclaimers(this.ingredientProduct);
  }

  getIngredientCategories() {
    const availableCategories: any[] = [];

    this.categories.forEach((categoryItem: any) => {
      const categoryProducts = [];

      this.products.forEach((product: any) => {
        const result = product.categories.some(
          (x: any) =>
            x.term_id === categoryItem.term_id ||
            x.parent === categoryItem.term_id
        );
        if (result) {
          categoryProducts.push(product);
        }
      });

      if (categoryProducts.length > 0) {
        availableCategories.push(categoryItem);
      }
    });

    this.ingredientCategories =
      this.removeRedundentCategories(availableCategories);
  }

  removeRedundentCategories(categories: any[]) {
    let slimCategories: any[] = [];

    categories.forEach((category: any) => {
      const products = this.getIngredientProducts(category.slug);
      let isNoServings = true;

      products.forEach((product: any) => {
        if (product.product_flavorTypes) {
          const servings = product.product_flavorTypes;

          if (servings.length !== 0) isNoServings = false;
        }
      });

      if (!isNoServings) slimCategories.push(category);
    });

    return slimCategories;
  }

  onSelectIngredientCategory(event: any) {
    this.selectedCategorySlug = event.target.value;

    this.ingredientProducts = [];
    this.ingredientServings = [];
    this.ingredientProduct = {};
    this.servingSize = '';
    this.ingredientChargedState = '';
    this.selectedProductSlug = '';
    this.ingredients = [];
    this.supplements = [];
    this.disclaimers = [];

    this.utilityService.navigateToRoute(
      '/ingredients/' + this.selectedCategorySlug,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    this.ingredientProducts = this.getIngredientProducts(
      this.selectedCategorySlug
    );
  }

  getIngredientProducts(categorySlug: string) {
    const category: any = this.categories.find(
      (category: any) => category.slug === categorySlug
    );
    const tempProducts: any[] = [];

    if (category) {
      this.products.forEach((product: any) => {
        const result = product.categories.some(
          (x: any) =>
            x.term_id === category.term_id || x.parent === category.term_id
        );
        if (result) {
          tempProducts.push(product);
        }
      });
    }

    return tempProducts;
  }

  onSelectIngredientProduct(event: any) {
    this.selectedProductSlug = event.target.value;

    this.ingredientServings = [];
    this.servingSize = '';
    this.ingredientChargedState = '';
    this.ingredients = [];
    this.supplements = [];
    this.disclaimers = [];

    this.utilityService.navigateToRoute(
      '/ingredients/' +
        this.selectedCategorySlug +
        '/' +
        this.selectedProductSlug,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );

    this.getIngredientServings(this.selectedProductSlug);
  }

  getIngredientServings(productSlug: string) {
    this.products.forEach((product: any) => {
      if (product.post_name === productSlug) {
        this.ingredientProduct = product;
        this.servingSize = '';
        this.ingredientChargedState = '';
        this.ingredients = [];
        this.supplements = [];
        this.disclaimers = [];
        this.ingredientServings = [];

        this.getFlavorIngredients(this.ingredientProduct);
        this.getServingSize(this.ingredientProduct);
        this.getIngredients(this.ingredientProduct);
        this.getSupplements(this.ingredientProduct);
        this.getDisclaimers(this.ingredientProduct);
      }
    });
  }

  getServingSize(product: any) {
    if (product.product_ingredients) {
      this.servingSize = product.product_ingredients.serving_size;
    }
  }

  getFlavorIngredients(product: any) {
    if (product.product_flavorTypes) {
      this.ingredientServings = product.product_flavorTypes;

      if (this.ingredientServings.length === 1)
        this.ingredientChargedState = product.product_flavorTypes[0].types;

      this.utilityService.navigateToRoute(
        '/ingredients/' +
          this.selectedCategorySlug +
          '/' +
          this.selectedProductSlug +
          '/' +
          this.ingredientChargedState,
        this.selectedCountry,
        this.selectedLanguage,
        this.isStaging,
        this.refCode,
        this.defaultLanguage
      );
    }
  }

  onSelectChargedState(event: any) {
    this.ingredientChargedState = event.target.value;

    this.getIngredients(this.ingredientProduct);
    this.getSupplements(this.ingredientProduct);
    this.getDisclaimers(this.ingredientProduct);

    this.utilityService.navigateToRoute(
      '/ingredients/' +
        this.selectedCategorySlug +
        '/' +
        this.selectedProductSlug +
        '/' +
        this.ingredientChargedState,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  getIngredients(product: any) {
    const tempIngredients: any[] = [];
    if (product.product_ingredients) {
      Object.values(product.product_ingredients).forEach((val: any) => {
        if (val.flavor_type === this.ingredientChargedState) {
          tempIngredients.push(val);
        }
      });
    }
    this.ingredients = tempIngredients;
  }

  getSupplements(product: any) {
    const tempSupplements: any[] = [];

    if (product.product_supplements) {
      product.product_supplements.forEach((val: any) => {
        if (val.flavor_type === this.ingredientChargedState) {
          tempSupplements.push(val);
        }
      });
    }

    this.supplements = tempSupplements;
  }

  getDisclaimers(product: any) {
    const tempDisclaimers: any[] = [];

    if (product.product_disclaimers) {
      product.product_disclaimers.forEach((val: any) => {
        if (val.flavor_type === this.ingredientChargedState) {
          tempDisclaimers.push(val);
        }
      });
    }

    this.disclaimers = tempDisclaimers;
  }

  getDisclaimerIngredients(ingredients: string) {
    let translatedText = '';
    this.translate.get('other-ingredients').subscribe((res: string) => {
      translatedText = res;
    });
    return translatedText + ' ' + ingredients;
  }

  getDisclaimerManufactures(manufactures: string) {
    let translatedText = '';
    this.translate.get('manufactured-for').subscribe((res: string) => {
      translatedText = res;
    });
    return translatedText + ' ' + manufactures;
  }

  getDisclaimerStorage(storage: string) {
    let translatedText = '';
    this.translate.get('storage').subscribe((res: string) => {
      translatedText = res;
    });
    return '<b>' + translatedText + '</b> ' + storage;
  }

  getDisclaimerInfo(disclaimer: string) {
    return disclaimer;
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
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
