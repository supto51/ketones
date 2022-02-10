import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppState } from 'src/app/store/app.reducer';
import { Food } from '../../models/food.model';
declare var $: any;
declare var foodLandSlide: any;
declare var loadTypeText: any;

@Component({
  selector: 'app-foods-home',
  templateUrl: './foods-home.component.html',
  styleUrls: ['./foods-home.component.css'],
})
export class FoodsHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  foods: Food[] = [];
  language = '';
  discountHeight = 0;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private productsDataService: ProductsDataService,
    private titleService: Title,
    private metaService: Meta,
    private store: Store<AppState>
  ) {
    $(document).on('hidden.bs.modal', '#foodDetailsModal', () => {
      $('.modal-backdrop').remove();
    });
  }

  ngOnInit(): void {
    this.setSeo();
    this.getLanguage();
    this.getDiscountHeight();
    this.getFoods();
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

  getLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.language = language;
      })
    );
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

  getFoods() {
    this.subscriptions.push(
      this.store
        .select('foodsList')
        .pipe(map((res) => res.foods))
        .subscribe((foods: Food[]) => {
          this.foods = foods;

          $(document).ready(() => {
            loadTypeText();
          });

          if (this.foods.length > 0) {
            setTimeout(() => {
              foodLandSlide();
            }, 0);
          }
        })
    );
  }

  checkZipCode() {
    this.productsDataService.changePostName('zip-modal');
    $('#userZipModal').modal('show');
  }

  setSeo() {
    this.titleService.setTitle(
      'Prüvit Food | Better Meals and Snacks. Now Delivered.'
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
