import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { SocketIoService } from '../services/socket-io.service';

@Component({
  selector: 'app-login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css']
})
export class LoginSignupComponent implements OnInit, AfterViewInit {
  submitMessage: string;
  constructor(private usersService: UsersService, private router: Router, public socketIo: SocketIoService) {
    this.submitMessage = "empty";
    this.usersService.logout();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Add event listener to material tab to clear error messages 
    const elem = document.querySelector('mat-tab-header');
    elem.addEventListener('click', () => {
      this.submitMessage = "empty";
    });
  }

  //Validate the email address entered using regex
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  registerUser(formFields) {
    // If any field is empty display error message
    if (formFields.value.name == undefined || formFields.value.name == '' ||
      formFields.value.email == undefined || formFields.value.email == '' ||
      formFields.value.password == undefined || formFields.value.password == '' ||
      formFields.value.confirmPassword == undefined || formFields.value.confirmPassword == '') {
      this.submitMessage = 'Please fill in all the fields';
      return;
    }
    else {
      //Valid email address
      if (!this.validateEmail(formFields.value.email)) {
        this.submitMessage = 'Please enter a valid email address';
        return;
      }
      //Check if password and confirm password are the same
      if (formFields.value.password != formFields.value.confirmPassword) {
        this.submitMessage = 'Password and confirm password does not match';
        return;
      }
      this.submitMessage = "empty";
      //Register the new user in database
      this.usersService.registerUser({ name: formFields.value.name, email: formFields.value.email, password: formFields.value.password }).subscribe(
        res => {
          console.log(res);
          if (res.message == "success") {
            this.submitMessage = "Account created. Login to continue";
            formFields.resetForm();
          }
          else {
            this.submitMessage = "Internal server error";
          }
        },
        err => {
          if (err.error.message == "email already exist") {
            this.submitMessage = "Login Id already exist";
          }
          else {
            this.submitMessage = "Internal server error";
          }
        }
      );
    }
  }

  signIn(formFields) {
    //If any field is empty display error message
    if (formFields.value.email == undefined || formFields.value.email == '' || formFields.value.password == undefined || formFields.value.password == '') {
      this.submitMessage = 'Please fill in all the fields';
      return;
    }
    else {
      //Validate the email address
      if (!this.validateEmail(formFields.value.email)) {
        this.submitMessage = 'Please enter a valid email address';
        return;
      }
      //Validate the user credentials and if successfull routes to home page
      this.usersService.loginUser({ email: formFields.value.email, password: formFields.value.password }).subscribe(
        res => {
          if (res.token) {
            this.usersService.updateLoginUserDetails(res.userId).subscribe(
              res => {
                this.socketIo.emitEventUserLogin(res.userId);
                this.router.navigate(['/home']);
              });
          }
          else {
            this.submitMessage = "Internal server error";
          }
        },
        err => {
          if (err.error.message == "User not found") {
            this.submitMessage = "The Login Id you entered did not match our records";
          }
          else if (err.error.message == "Wrong password") {
            this.submitMessage = "The password you entered did not match our records";
          }
          else {
            this.submitMessage = "Internal server error";
          }
        }
      );
    }
  }
}
