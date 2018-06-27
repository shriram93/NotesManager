import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { UsersService } from './users.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private userService: UsersService) { }

  //If the user has no valid token, then navigate back to root page
  canActivate() {
    this.userService.beaerTokenSubject.subscribe(token => {
      if (token == "Undefined") {
        this.router.navigate(['/']);
      }
    });
    return true;
  }

}
