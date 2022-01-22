import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../shared/services/app-data.service';
import { AppSeoService } from '../shared/services/app-seo.service';

@Component({
  selector: 'app-policy-redirect',
  templateUrl: './procedures-redirect.component.html',
  styleUrls: ['./procedures-redirect.component.css'],
})
export class ProceduresRedirectComponent implements OnInit {
  selectedCountry = '';
  isPageFound = false;

  constructor(
    private dataService: AppDataService,
    private seoService: AppSeoService
  ) {}

  ngOnInit(): void {
    this.setSeo();
    this.getSelectedCountry();
  }

  getSelectedCountry() {
    this.isPageFound = false;

    this.dataService.currentSelectedCountry.subscribe((countryCode: string) => {
      this.selectedCountry = countryCode;

      if (this.selectedCountry.toLowerCase() === 'ca') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052021992';
      } else if (this.selectedCountry.toLowerCase() === 'au') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052118072';
      } else if (this.selectedCountry.toLowerCase() === 'mo') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052118092';
      } else if (this.selectedCountry.toLowerCase() === 'hk') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052574291';
      } else if (this.selectedCountry.toLowerCase() === 'sg') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052574551';
      } else if (this.selectedCountry.toLowerCase() === 'my') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052118132';
      } else if (this.selectedCountry.toLowerCase() === 'mx') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052023472';
      } else if (this.selectedCountry.toLowerCase() === 'nz') {
        // window.location.href =
        //   'https://support.justpruvit.com/hc/en-us/articles/360052118492';
      } else if (this.selectedCountry.toLowerCase() === 'de') {
        this.isPageFound = true;
        window.location.href =
          'https://shopketo.com/de/page/policies-and-procedures';
      } else if (this.selectedCountry.toLowerCase() === 'gb') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'it') {
        this.isPageFound = true;
        window.location.href =
          'https://shopketo.com/it/page/policies-and-procedures';
      } else if (this.selectedCountry.toLowerCase() === 'es') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'nl') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'at') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'pl') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'ie') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'se') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'hu') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'fr') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'pt') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'fi') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'be') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else if (this.selectedCountry.toLowerCase() === 'ro') {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052783292';
      } else {
        this.isPageFound = true;
        window.location.href =
          'https://support.justpruvit.com/hc/en-us/articles/360052011752';
      }
    });
  }

  setSeo() {
    this.seoService.setCanonicalLink();

    this.seoService.updateTitle('Policies & Procedures');
    this.seoService.updateDescription(
      'This Policies & Procedures article applies to European countries and the UK with the exception of Italy which operates under the US Policies & Procedures.'
    );

    this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
      if (!status) {
        this.seoService.updateRobots('noindex,follow');
      }
    });
  }
}
