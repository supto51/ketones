import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { Food } from '../../../models/food.model';
import { FoodUtilityService } from '../../../services/food-utility.service';
import {
  SetFoodModalNameActon,
  UpdateFoodAction,
} from '../../../store/foods-list.actions';
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-food-card',
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.css'],
})
export class FoodCardComponent implements OnInit, OnDestroy {
  @Input() food = {} as Food;
  @Input() isStartPlanning = false;
  country = '';
  language = '';
  eligibleNoOfItems = 0;
  noOfItems = 0;
  isTooltipShown = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private foodUtilityService: FoodUtilityService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.getCountry();
    this.getLanguage();
    this.getFoods();
  }

  getCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe(
        (countryCode: string) => {
          this.country = countryCode;
        }
      )
    );
  }

  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.language = language;
      })
    );
  }

  getFoods() {
    this.subscriptions.push(
      this.store.select('foodsList').subscribe((res) => {
        this.noOfItems = res.boxes.noOfItems;

        const discountInfo = res.discountsInfo;

        this.eligibleNoOfItems =
          discountInfo.itemsPerBox && discountInfo.maxBoxes
            ? discountInfo.itemsPerBox * discountInfo.maxBoxes
            : 0;

        $(document).ready(() => {
          tooltipJS();
        });
      })
    );
  }

  onClickFoodImage(id: string) {
    this.store.dispatch(new SetFoodModalNameActon(id));
  }

  onClickMinus() {
    if (typeof this.food.quantity !== 'undefined' && this.food.quantity > 0) {
      const tempFood = Object.assign({}, this.food);

      if (typeof tempFood.quantity !== 'undefined') {
        tempFood.quantity--;

        this.food = tempFood;
      }

      this.store.dispatch(new UpdateFoodAction(this.food));
      this.foodUtilityService.saveFoodToLocalStorage(
        this.food,
        this.country,
        this.language
      );
    }
  }

  onClickPlus() {
    if (
      typeof this.food.quantity !== 'undefined' &&
      this.food.quantity < this.food.maxQuantity &&
      this.noOfItems < this.eligibleNoOfItems
    ) {
      const tempFood = Object.assign({}, this.food);

      if (typeof tempFood.quantity !== 'undefined') {
        tempFood.quantity++;

        this.food = tempFood;
      }

      this.store.dispatch(new UpdateFoodAction(this.food));
      this.foodUtilityService.saveFoodToLocalStorage(
        this.food,
        this.country,
        this.language
      );
    }
  }

  toggleTooltip(foodId: string, i: number) {
    this.isTooltipShown = !this.isTooltipShown;

    if (this.isTooltipShown) {
      $('[data-toggle="tooltip"]#card' + foodId + i).tooltip('show');
    } else {
      $('[data-toggle="tooltip"]#card' + foodId + i).tooltip('hide');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscriber) => subscriber.unsubscribe());
  }
}
