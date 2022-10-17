import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: any;
  password: any;
  constructor(private auth: AuthService, private router: Router,private toastr: ToastrService) {}

  ngOnInit(): void {}

  login() {
    if (this.email == '') {
      this.toastr.warning('Please enter email');
      return;
    }

    if (this.password == '') {
      this.toastr.warning('Please enter password');
      return;
    }
    this.toastr.info('Loging in......')
    this.auth.login(this.email, this.password).then(
      (res: any) => {
        if (res?.user?.refreshToken) {
          sessionStorage.setItem('isNewUser', res?.user?.isNewUser);
          sessionStorage.setItem('token', res?.user?.refreshToken);
          sessionStorage.setItem('uid', res?.user?.uid);
          sessionStorage.setItem('email', res?.user?.providerData[0].email);
          this.auth.getDetails('Employee', res?.user?.uid).then((eres: any) => {
            if (eres.length) {
              console.log(eres, 'ereses');
              sessionStorage.setItem('role', eres[0].role);
              if (eres[0].role === 'admin') {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.router.navigate(['/dashboard']);
            }
          });
          this.toastr.success('Login Successful')
        } else {
          this.router.navigate(['/login']);
        }
      },
      (err: any) => {
        this.toastr.warning('Login failed, please try again later')
        this.router.navigate(['/login']);
      }
    );

    this.email = '';
    this.password = '';
  }
}
