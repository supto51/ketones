import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { environment } from 'src/environments/environment';
import { FoodDiscount } from '../../models/food-discount.model';
import { QuickAddMenus } from '../../models/food-quickadd-menus.model';
import { Food } from '../../models/food.model';
import { FoodUtilityService } from '../../services/food-utility.service';
import {
  SetFoodsAction,
  SetQuickAddMenusActon,
} from '../../store/foods-list.actions';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-foods-select',
  templateUrl: './foods-select.component.html',
  styleUrls: ['./foods-select.component.css'],
})
export class FoodsSelectComponent implements OnInit, AfterViewInit, OnDestroy {
  foods: Food[] = [];
  foodTypes: string[] = [];
  foodSubCategories: string[] = [];
  isAutoshipAvailable = false;
  discountHeight = 0;
  language = '';
  country = '';
  refCode = '';
  defaultLanguage = '';
  isStaging: boolean;
  selectedCategory = '';
  selectedDiets: string[] = [];
  selectedSort = '';
  selectedSubCategory = 'all';
  discountInfo = {} as FoodDiscount;
  quickAddMenus = {} as QuickAddMenus;
  boxTotalPrice = 0;
  quickAddMenusList = '';
  noOfItems = 0;
  eligibleNoOfItems = 0;
  isTooltipShown = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private sidebarDataService: SidebarDataService,
    private utilityService: AppUtilityService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService,
    private foodUtilityService: FoodUtilityService,
    private titleService: Title,
    private metaService: Meta,
    private store: Store<AppState>
  ) {
    this.isStaging = environment.isStaging;

    $(document).on('hidden.bs.modal', '#foodDetailsModal', () => {
      $('.modal-backdrop').remove();
    });
  }

  ngOnInit(): void {
    this.setSeo();
    this.loadZipModal();
    this.getDiscountHeight();
    this.getFoods();
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();

    window.scroll(0, 0);
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

  loadZipModal() {
    const localFoodUser = localStorage.getItem('MVUser');
    const FoodUser = localFoodUser ? JSON.parse(localFoodUser) : null;

    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    if (FoodUser !== null && autoshipFoods.length === 0) {
      this.productsDataService.changePostName('zip-modal');
      $('#userZipModal').modal('show');
    }
  }

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.language = language;

        this.getDefaultLanguage();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.country = country;
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
          }
        }
      )
    );
  }

  getDiscountHeight() {
    const bodyClasses =
      document.getElementById('body-element')?.classList.value;

    if (bodyClasses && !bodyClasses.includes('body-gray')) {
      this.renderer.addClass(document.body, 'body-gray');
    }

    this.dataService.currentDiscountHeight.subscribe((height: number) => {
      this.discountHeight = height;
    });

    this.renderer.addClass(document.body, 'extr-padd-btm');
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.foods = res.foods;
        this.foodTypes = res.types;
        this.foodSubCategories = res.subCategories;
        this.discountInfo = res.discountsInfo;
        this.quickAddMenus = res.quickAddMenus;

        this.selectedDiets = res.selectedDiets;
        this.selectedCategory = res.selectedCategory;
        this.selectedSort = res.selectedSort;

        this.noOfItems = res.boxes.noOfItems;

        this.eligibleNoOfItems =
          this.discountInfo.itemsPerBox && this.discountInfo.maxBoxes
            ? this.discountInfo.itemsPerBox * this.discountInfo.maxBoxes
            : 0;

        this.boxTotalPrice = res.foods.reduce((sum, food) => {
          let quickAddPrice = 0;

          this.quickAddMenus.menus.forEach((item) => {
            if (item.id === food.id && !food.isOutOfStock) {
              quickAddPrice = food.price * item.quantity;
            }
          });

          return sum + quickAddPrice;
        }, 0);

        this.quickAddMenusList = this.quickAddMenus.menus
          .map((item) => {
            let foodItem = '';
            res.foods.forEach((food) => {
              if (item.id === food.id) {
                foodItem = item.quantity + ' x ' + food.name;
              }
            });
            return foodItem;
          })
          .join('<br>');

        this.setShippingInfo();

        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  setShippingInfo() {
    const localFoodUser = localStorage.getItem('MVUser');
    const FoodUser = localFoodUser ? JSON.parse(localFoodUser) : null;

    const autoshipFoods: { sku: string; quantity: number }[] =
      FoodUser === null ||
      (Object.keys(FoodUser).length === 0 && FoodUser.constructor === Object)
        ? []
        : FoodUser.food_autoship_data;

    this.isAutoshipAvailable = autoshipFoods.length > 0;
  }

  onClickQuickAddPlus() {
    let isMenuOutOfBound = false;
    this.foods.forEach((food) => {
      this.quickAddMenus.menus.forEach((item) => {
        if (
          item.id === food.id &&
          !food.isOutOfStock &&
          typeof food.quantity !== 'undefined'
        ) {
          if (food.quantity + item.quantity > food.maxQuantity) {
            isMenuOutOfBound = true;
          }
        }
      });
    });

    const noOfQuickMenuItems = this.quickAddMenus.menus.reduce(
      (sum, item) => item.quantity + sum,
      0
    );
    const totalQuickMenuItems = this.noOfItems + noOfQuickMenuItems;

    if (totalQuickMenuItems <= this.eligibleNoOfItems && !isMenuOutOfBound) {
      const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);

      tempQuickAddMenus.quantity++;

      this.quickAddMenus = tempQuickAddMenus;

      this.store.dispatch(new SetQuickAddMenusActon(this.quickAddMenus));

      this.updateQuickMenusToCarts(true);
    }
  }

  onClickQuickAddMinus() {
    const tempQuickAddMenus = Object.assign({}, this.quickAddMenus);

    tempQuickAddMenus.quantity--;

    this.quickAddMenus = tempQuickAddMenus;

    this.store.dispatch(new SetQuickAddMenusActon(this.quickAddMenus));

    this.updateQuickMenusToCarts(false);
  }

  updateQuickMenusToCarts(isSet: boolean) {
    const updatedFoods = this.foods.map((food) => {
      const tempFood = Object.assign({}, food);
      this.quickAddMenus.menus.forEach((item) => {
        if (
          item.id === food.id &&
          !food.isOutOfStock &&
          typeof food.quantity !== 'undefined'
        ) {
          if (isSet) {
            tempFood.quantity = food.quantity + item.quantity;
          } else {
            if (food.quantity >= item.quantity) {
              tempFood.quantity = food.quantity - item.quantity;
            }
          }
        }
      });
      return tempFood;
    });

    this.store.dispatch(new SetFoodsAction(updatedFoods));
    this.foodUtilityService.saveFoodsToLocalStorage(
      updatedFoods,
      this.country,
      this.language
    );
  }

  toggleTooltip(event: Event) {
    event.preventDefault();

    this.isTooltipShown = !this.isTooltipShown;

    if (this.isTooltipShown) {
      $('[data-toggle="tooltip"]#whatsInIt').tooltip('show');
    } else {
      $('[data-toggle="tooltip"]#whatsInIt').tooltip('hide');
    }
  }

  onClickSubCategory(subCategory: string) {
    this.selectedSubCategory = subCategory;
  }

  onClickHome() {
    this.utilityService.navigateToRoute(
      '/',
      this.country,
      this.language,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  onClickFilterAndSort() {
    this.sidebarDataService.changeSidebarName('food-filter');
    $('.drawer').drawer('open');
  }

  setSeo() {
    this.titleService.setTitle(
      'Choose Your Delicious Meals and Snacks | Prüvit Food'
    );
    this.metaService.updateTag({
      name: 'description',
      content:
        'Healthy, delicious, Prüvit approved meals made with farm-fresh ingredients, ready in 5 minutes or less.',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: 'assets/images/food-site-image.jpeg',
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
