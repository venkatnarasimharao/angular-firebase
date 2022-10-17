import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  shift: any = '';
  role = sessionStorage.getItem('role');
  result: any = {};
  userDetails: any = [];
  spinner = true;
  tableDetail: any = [];
  allShiftDetails: any = [];
  navbarCollapsed: boolean = true;
  spinnerPopup: boolean = false;
  breaksDetails: any = [];
  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    public router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  openPopup(uid: any, type: string) {
    this.spinnerPopup = true;
    this.breaksDetails = [];
    $('#exampleModal').modal('show');
    this.dashboardService.getDetails(uid, type).then((data: any) => {
      console.log(data, 'chchchch');
      if (data && data.length) {
        data = data.sort((a: any, b: any) => {
          return +new Date(a.break.toMillis()) - +new Date(b.break.toMillis());
        });
        for (let i = 0; i < data.length; i++) {
          console.log(data[i].break.toMillis());
          if (!(i % 2)) {
            this.breaksDetails.push({
              breakSt: data[i] && data[i].break ? data[i].break : '',
              breakEt:
                data[i + 1] && data[i + 1].break ? data[i + 1].break : '',
            });
          }
        }
      }
      this.spinnerPopup = false;
      console.log(this.breaksDetails, 'ff');
    });
  }

  closePopup() {
    $('#exampleModal').modal('hide');
  }

  getUserDetails() {
    this.spinner = true;
    this.getDetails();
    let id: any = '';
    if (this.role === 'user') id = sessionStorage.getItem('uid');

    this.authService.getDetails('Employee', id).then((res) => {
      this.userDetails = res;
      console.log(this.userDetails, 'userDetails');
      this.tableDetails();
    });
  }

  getDetails() {
    let id: any = '';
    if (this.role === 'user') id = sessionStorage.getItem('uid');

    this.dashboardService.getDetails(id).then((data: any) => {
      console.log(data, 'ashhs');
      if (data.length) {
        this.allShiftDetails = data;
        let finalShift = data.filter((e: any) => {
          return e.shiftCond;
        });
        console.log(finalShift, 'finalShift');

        this.result = finalShift && finalShift.length ? finalShift[0] : {};
        this.shift =
          finalShift && finalShift.length && finalShift[0].shift
            ? finalShift[0].shift
            : '';
      }
    });
  }

  tableDetails() {
    this.tableDetail = [];
    if (this.userDetails.length && !this.allShiftDetails.length) {
      this.tableDetail = this.userDetails;
    } else {
      for (const row of this.userDetails) {
        for (const shift of this.allShiftDetails) {
          if (row.id === shift.id) {
            this.tableDetail.push({
              uid: row.id,
              role: row.role,
              username: row.username,
              shift: shift.shift,
              startTime: shift.startTime,
              endTime: shift.endTime,
              break: shift.break,
              lunch: shift.lunch,
            });
          } else if (this.role === 'admin') {
            this.tableDetail.push({
              uid: row.id,
              role: row.role,
              username: row.username,
            });
          }
        }
      }
    }
    console.log(this.tableDetail, 'tableDetail');
    this.spinner = false;
  }

  startShift(bill: boolean) {
    const body = {
      id: sessionStorage.getItem('uid'),
      shift: this.shift,
      shiftCond: bill,
      startTime: new Date(),
    };
    this.dashboardService
      .createCollection(body, 'shift')
      .then((data) => {
        console.log(data, 'changess');
        this.toastr.success('Shift started successfully');
        this.getUserDetails();
      })
      .catch((error) => {
        console.log(error, 'error is ');
        this.toastr.warning('Unable to process your request');
      });
  }

  endShift(bill: boolean) {
    if (this.result.uuid) {
      const body = {
        id: sessionStorage.getItem('uid'),
        shiftCond: bill,
        endTime: new Date(),
        break: false,
        lunch: false,
      };
      this.dashboardService
        .updateData(body, this.result.uuid)
        .then((data) => {
          console.log(data, 'changesss');
          this.toastr.success('Shift signoff successfully');
          this.getUserDetails();
        })
        .catch((error) => {
          console.log(error, 'error is ');
          this.toastr.warning('Unable to process your request');
        });
    }
  }

  startOrEndBreak(bool: boolean) {
    let body: any = {
      id: sessionStorage.getItem('uid'),
      break: bool,
    };
    let tost = '';
    body['break'] = new Date();
    if (bool) {
      tost = 'started';
    } else {
      tost = 'ended';
    }
    this.dashboardService
      .createCollection(body, 'break')
      .then((data) => {
        console.log(data, 'changesss');
        this.toastr.success(`Break ${tost} successfully`);

        // this to make sure that break has started by current user
        if (this.result.uuid) this.notifyingBreakOrLunch({ break: bool });
      })
      .catch((error) => {
        console.log(error, 'error is ');
        this.toastr.warning('Unable to process your request');
      });
  }

  startOrEndLunch(bool: boolean) {
    let body: any = {
      id: sessionStorage.getItem('uid'),
      lunch: bool,
    };
    body['break'] = new Date();
    let tost = '';
    if (bool) {
      tost = 'started';
    } else {
      tost = 'ended';
    }
    this.dashboardService
      .createCollection(body, 'lunch')
      .then((data) => {
        console.log(data, 'changess');
        this.toastr.success(`Break ${tost} successfully`);

        // this to make sure that break has started by current user
        if (this.result.uuid) this.notifyingBreakOrLunch({ lunch: bool });
      })
      .catch((error) => {
        console.log(error, 'error is ');
        this.toastr.warning('Unable to process your request');
      });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  notifyingBreakOrLunch(obj: any) {
    let body: any = {
      id: sessionStorage.getItem('uid'),
    };
    body = Object.assign(body, obj);
    this.dashboardService.updateData(body, this.result.uuid).then(() => {
      this.getUserDetails();
    });
  }
}
