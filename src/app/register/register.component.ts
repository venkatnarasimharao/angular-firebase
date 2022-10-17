import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  email: string = '';
  password: string = '';
  admin: any = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  register() {
    if (!this.email) {
      this.toastr.warning('Please enter email');
      return;
    }
    if (!this.password) {
      this.toastr.warning('Please enter password');
      return;
    }
    this.auth.register(this.email, this.password).then(
      (res: any) => {
        this.auth.createUser(res, this.admin);
        this.toastr.success('Registed successfully');
      },
      (err: any) => {
        console.log(err.message);
        this.toastr.error('Registed failed, try with another mail');
        this.router.navigate(['/register']);
      }
    );

    this.email = '';
    this.password = '';
  }
}
