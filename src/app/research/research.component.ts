import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from '../shared/services/app-data.service';
import { Research } from './models/research.model';
import { ResearchApiService } from './services/research-api.service';
import * as researchActions from './store/research-videos.actions';
import { ProductsDataService } from '../products/services/products-data.service';
import { ResearchState } from './store/research.reducer';
import { AppUtilityService } from '../shared/services/app-utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.css'],
})
export class ResearchComponent implements OnInit, OnDestroy {
  selectedCountry = '';
  isLoaded = false;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private dataService: AppDataService,
    private researchApiService: ResearchApiService,
    private store: Store<ResearchState>,
    private productsDataService: ProductsDataService,
    private utilityService: AppUtilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSelectedCountryAndLanguage();
  }

  getSelectedCountryAndLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe(
        (countryCode: string) => {
          this.selectedCountry = countryCode;

          this.subscriptions.push(
            this.dataService.currentSelectedLanguage.subscribe(
              (language: string) => {
                this.subscriptions.push(
                  this.productsDataService.currentProductsData.subscribe(
                    (productsData: any) => {
                      if (productsData) {
                        this.getResearchVideos(
                          countryCode,
                          language,
                          productsData.default_lang
                        );
                      }
                    }
                  )
                );
              }
            )
          );
        }
      )
    );
  }

  getResearchVideos(
    country: string,
    language: string,
    defaultLanguage: string
  ) {
    this.subscriptions.push(
      this.researchApiService
        .getResearchVideos(country, language, defaultLanguage)
        .subscribe((responseData: Research[]) => {
          this.store.dispatch(
            new researchActions.SetResearchVideos({
              videos: responseData,
            })
          );

          this.setRedirectURL();
          this.isLoaded = true;
        })
    );
  }

  setRedirectURL() {
    this.utilityService.setRedirectURL(this.router.url, this.selectedCountry);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
