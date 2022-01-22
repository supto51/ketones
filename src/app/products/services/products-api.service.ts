import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProductsApiService {
  domainPath: string;
  apiPath = 'wp-json/wp/pruvitnow/products';

  constructor(private http: HttpClient) {
    this.domainPath = environment.domainPath;
  }

  getProducts(country: string) {
    if (country.toLowerCase() === 'us') {
      return this.http.get(this.domainPath + '/' + this.apiPath);
    } else {
      return this.http.get(
        this.domainPath + '/' + country.toLowerCase() + '/' + this.apiPath
      );
    }
  }

  getProductsWithLanguage(country: string, language: string) {
    if (country.toLowerCase() === 'us') {
      if (language !== '') {
        return this.http.get(
          this.domainPath + '/' + this.apiPath + '/lang/?lang_code=' + language
        );
      } else {
        return this.http.get(this.domainPath + '/' + this.apiPath + '/lang');
      }
    } else {
      if (language !== '') {
        return this.http.get(
          this.domainPath +
            '/' +
            country.toLowerCase() +
            '/' +
            this.apiPath +
            '/lang/?lang_code=' +
            language
        );
      } else {
        return this.http.get(
          this.domainPath +
            '/' +
            country.toLowerCase() +
            '/' +
            this.apiPath +
            '/lang'
        );
      }
    }
  }
}
