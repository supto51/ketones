import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
declare var productTabsJS: any;
declare var productInfoJS: any;
declare var $: any;

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
})
export class InfoComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  products: any[] = [];
  product: any = {};
  chargedState = '';
  productsData: any = {};
  faqs1: any[] = [];
  faqs2: any[] = [];
  reviews: any[] = [];
  suggestedUse = '';
  servingSize = '';
  slicedIndex = 1;
  slicedReviews: any[] = [];
  isTabShowable = true;
  ingredients: any[] = [];
  supplements: any[] = [];
  disclaimers: any[] = [];
  productFlavorTypes: any[] = [];
  subscriptions: SubscriptionLike[] = [];
  defaultLanguage = '';
  isStaging: boolean;
  rebootDate = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: AppDataService,
    private translate: TranslateService,
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

  tabShowableJS() {
    $(document).ready(() => {
      $('ul#sk-product__info-list > li button').removeClass('active');
      $('#sk-product__info-details .sk-product__item-info').addClass(
        'display-none'
      );
      $('#sk-product__info-details .sk-product__item-info').removeAttr('style');

      if ($('ul#sk-product__info-list > li').length > 1) {
        $('ul#sk-product__info-list > li button:first').addClass('active');
        const pageAttr = $('ul#sk-product__info-list > li button.active').data(
          'page'
        );

        $(
          '#sk-product__info-details .sk-product__item-info[data-page="' +
            pageAttr +
            '"]'
        ).removeClass('display-none');

        this.isTabShowable = true;
      } else {
        $('#sk-product__info-details .sk-product__item-info:first').removeClass(
          'display-none'
        );
        this.isTabShowable = false;
      }
    });
  }

  /* --------- product section ------------- */
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
    if (this.isStaging) {
      this.route.queryParamMap.subscribe((params) => {
        const refCode = params.get('ref');
        if (refCode !== null) {
          this.refCode = refCode;
        }
      });
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

            this.rebootDate = productsData.reboot_start_month;
            this.productsData = productsData;
            this.products = productsData.list;
            this.getProduct();
          }
        }
      )
    );
  }

  getProduct() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.product = {};

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            if (product.post_name === params['id']) {
              this.product = product;
              this.chargedState = '';
              this.faqs1 = [];
              this.faqs2 = [];
              this.reviews = [];
              this.suggestedUse = '';
              this.servingSize = '';
              this.slicedIndex = 1;
              this.slicedReviews = [];
              this.ingredients = [];
              this.supplements = [];
              this.disclaimers = [];
              this.isTabShowable = true;
              this.subscriptions = [];
              this.productFlavorTypes = [];

              this.getFlavorIngredients(this.product);
              this.getFaqs();
              this.getReviews();
              this.getSuggestedUse(this.product);
              this.getIngredients(this.product);
              this.getSupplements(this.product);
              this.getDisclaimers(this.product);

              this.getProductInfoJS();
              this.getProductTabsJS();
              this.tabShowableJS();
            }
          });
        }
      })
    );
  }

  getProductInfoJS() {
    $(document).ready(() => {
      productInfoJS();
    });
  }

  getProductTabsJS() {
    $(document).ready(() => {
      productTabsJS();
    });
  }

  getFlavorIngredients(product: any) {
    if (product.product_flavorTypes) {
      this.productFlavorTypes = product.product_flavorTypes;
      this.chargedState = product.product_flavorTypes[0].types;
    }
  }

  getIngredients(product: any) {
    const tempIngredients: any[] = [];
    if (product.product_ingredients) {
      Object.values(product.product_ingredients).forEach((val: any) => {
        if (val.flavor_type === this.chargedState) {
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
        if (val.flavor_type === this.chargedState) {
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
        if (val.flavor_type === this.chargedState) {
          tempDisclaimers.push(val);
        }
      });
    }

    this.disclaimers = tempDisclaimers;
  }

  onSelectChargedState(event: any) {
    this.chargedState = event.target.value;

    this.getIngredients(this.product);
    this.getSupplements(this.product);
    this.getDisclaimers(this.product);
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

  getFaqs() {
    const faqsData = this.productsData.faq;

    if (faqsData) {
      Object.entries(faqsData).forEach(([key, value]: [string, any]) => {
        if (key === this.product.faq_unique_key) {
          let tempFaqs = [];
          tempFaqs = value;
          const halfLength = Math.ceil(tempFaqs.length / 2);
          this.faqs1 = tempFaqs.slice(0, halfLength);
          this.faqs2 = tempFaqs.slice(-halfLength);
        }
      });
    }
  }

  getReviews() {
    const reviewsData = this.productsData.review;

    if (reviewsData) {
      if (this.product.categories.length > 0) {
        Object.entries(reviewsData).forEach(([key, value]: [string, any]) => {
          this.product.categories.forEach((category: any) => {
            if (+key === category.term_id) {
              this.reviews = value;
              this.slicedReviews = value.slice(0, this.slicedIndex * 2);
            }
          });
        });
      }
    }
  }

  onClickReadMore() {
    this.slicedIndex += 1;
    this.slicedReviews = this.reviews.slice(0, this.slicedIndex * 2);
  }

  getRatingArray(rating: any) {
    if (rating) {
      if (typeof rating === 'string') {
        rating = Math.round(+rating);
      } else {
        rating = Math.round(rating);
      }
      return new Array(rating);
    } else {
      return [];
    }
  }

  getNonRatingArray(rating: any) {
    if (rating) {
      if (typeof rating === 'string') {
        rating = Math.round(+rating);
      } else {
        rating = Math.round(rating);
      }
      return new Array(5 - rating);
    } else {
      return [];
    }
  }

  getAverageRating() {
    let ratingSum = 0;
    this.reviews.forEach((review: any) => {
      ratingSum += review.rating;
    });
    const averageRating = ratingSum / this.reviews.length;
    return averageRating.toFixed(1);
  }

  getRelativeTime(time: string) {
    const current = new Date().getTime();
    const previous = +time * 1000;

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;
    let translatedText = '';

    if (elapsed < msPerMinute) {
      this.translate.get('seconds-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / 1000) + ' ' + translatedText;
    } else if (elapsed < msPerHour) {
      this.translate.get('minutes-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / msPerMinute) + ' ' + translatedText;
    } else if (elapsed < msPerDay) {
      this.translate.get('hours-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / msPerHour) + ' ' + translatedText;
    } else if (elapsed < msPerMonth) {
      this.translate.get('days-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / msPerDay) + ' ' + translatedText;
    } else if (elapsed < msPerYear) {
      this.translate.get('months-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / msPerMonth) + ' ' + translatedText;
    } else {
      this.translate.get('years-ago').subscribe((res: string) => {
        translatedText = res;
      });
      return Math.round(elapsed / msPerYear) + ' ' + translatedText;
    }
  }

  getReviewersFirstLetters(name: string) {
    let firstLetters = '';
    firstLetters +=
      name.split(' ')[0].substr(0, 1) + name.split(' ')[1].substr(0, 1);
    return firstLetters;
  }

  getSuggestedUse(product: any) {
    if (product.product_ingredients) {
      this.suggestedUse = product.product_ingredients.ingredient_directions;
      this.servingSize = product.product_ingredients.serving_size;
    }
  }

  getProductPostContent(postContent: string) {
    let finalPostContent = '';
    if (postContent) {
      if (
        postContent.includes(
          '<span id="update-keto-month" class="brand-purple next-reboot-md">'
        )
      ) {
        finalPostContent = postContent.replace(
          '<span id="update-keto-month" class="brand-purple next-reboot-md">',
          '<span id="update-keto-month" class="brand-purple next-reboot-md">' +
            this.rebootDate
        );
      } else {
        finalPostContent = postContent;
      }
    }
    return finalPostContent;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
