import { Component, OnInit } from '@angular/core';
import { UserEmitterService } from 'src/app/shared/services/user-emitter.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public user: any;
  constructor(private userEmitterService: UserEmitterService) {}

  ngOnInit(): void {
    this.userEmitterService.getProfileObs().subscribe(x => {
      this.user = x;
    });
  }
}
