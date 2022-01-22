import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { ProductsDataService } from 'src/app/products/services/products-data.service';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { Research } from '../../models/research.model';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ResearchState } from '../../store/research.reducer';
import { map } from 'rxjs/operators';
declare var $: any;
declare var aosJS: any;
declare var researchSliderJS: any;
declare var researchFlipCardJS: any;

@Component({
  selector: 'app-research-home',
  templateUrl: './research-home.component.html',
  styleUrls: ['./research-home.component.css'],
})
export class ResearchHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  discountHeight = 0;
  researchVideos: Research[] = [];
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private renderer: Renderer2,
    private dataService: AppDataService,
    private productsDataService: ProductsDataService,
    private store: Store<ResearchState>,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    researchFlipCardJS();

    this.getDiscountHeight();
    this.getSelectedLanguage();
    this.getSelectedCountry();
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

  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe(
        (countryCode: string) => {
          this.selectedCountry = countryCode;

          this.getResearchVideos();
        }
      )
    );
  }

  getResearchVideos() {
    this.subscriptions.push(
      this.store
        .select('research')
        .pipe(map((res) => res.researchVideos))
        .subscribe((videos: any) => {
          this.researchVideos = videos.researchVideos;

          $(document).ready(() => {
            if (this.researchVideos.length > 3) {
              researchSliderJS();
            }

            $(document).ready(() => {
              aosJS();
            });
          });
        })
    );
  }

  onClickYoutube(videoID: string) {
    const videoLink = 'https://www.youtube.com/embed/' + videoID;
    this.dataService.setPruvitTvLink(videoLink);
    this.productsDataService.changePostName('pruvit-modal-utilities');
    $('#pruvitTVModal').modal('show');
  }

  ngOnDestroy() {
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
