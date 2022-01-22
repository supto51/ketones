import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class SidebarApiService {
  domainPath: string;

  constructor(private http: HttpClient) {
    this.domainPath = environment.domainPath;
  }

  getCountries() {
    return this.http.get(
      this.domainPath + '/wp-json/wp/pruvitnow/country-list'
    );
  }

  getLanguagesForCountry(country: string) {
    if (country.toLowerCase() === 'us') {
      return this.http.get(
        this.domainPath + '/wp-json/wp/pruvitnow/language-list'
      );
    } else {
      return this.http.get(
        this.domainPath +
          '/' +
          country.toLowerCase() +
          '/wp-json/wp/pruvitnow/language-list'
      );
    }
  }

  getTinyUrl(url: string) {
    return this.http.get(
      'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url),
      {
        responseType: 'text',
      }
    );
  }
}
