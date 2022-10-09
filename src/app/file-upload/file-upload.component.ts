import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '.././local-storage.service'
import { IGooglePay } from '.././file-upload'
import * as _ from 'underscore';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [LocalStorageService]
})
export class FileUploadComponent implements OnInit {

  statusIcons = {
    on: 'check_circle_outline',
    off: 'highlight_off'
  };
  mapUploadStatus: string = this.statusIcons.off;
  payUploadStatus: string = this.statusIcons.off;

  directionMap = {
    S: 's',
    R: 'r',
    P: 's'
  }

  gPayData: IGooglePay[] = [];


  constructor(private router: Router, private localStorageService: LocalStorageService) {
    this.localStorageService.clearStorage('mapJSON');
    this.localStorageService.clearStorage('payJSON');
  }

  ngOnInit(): void {
  }

  selectGoogleMapJSON (e:Event) {
    var target = e.target as HTMLInputElement;
    var files = target.files as FileList;
    var file = files[0];

    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = () => {
      var result = JSON.parse(reader.result as string);
      this.localStorageService.setItemToStorage('mapJSON', JSON.stringify(result));
      this.mapUploadStatus = this.statusIcons.on;
      this.checkAndNavigate();
    };
  }

  selectGooglePayHTML (e:Event) {
    var target = e.target as HTMLInputElement;
    var files = target.files as FileList;
    var file = files[0];

    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = () => {
      let parser = new DOMParser();
      let node = parser.parseFromString(reader.result as string, 'text/html');
      let _this = this;
      _.each(node?.body?.firstChild?.childNodes || [], function(each){
        let txt = each?.firstChild?.childNodes[1].childNodes[0].textContent || '';
        let direction = txt.split("")[0];
        let amount = (txt.match(/₹[0-9]*\.[0-9][0-9]/g) || ['₹0.00'])[0];
        let dateUTCStr = (each?.firstChild?.childNodes[1].childNodes[2].textContent || '').replace(',', '').replace('IST', 'GMT+0530');
        let status = ((each?.firstChild?.childNodes[3].textContent || '').match(/Completed|Failed|Pending|Cancelled/) || ['Unknown'])[0];

        _this.gPayData.push({
          amount: amount,
          timestamp: dateUTCStr,
          status: status,
          direction: _this.directionMap[direction],
          location: {}
        });
      });

      this.localStorageService.setItemToStorage('payJSON', JSON.stringify(this.gPayData));
      this.payUploadStatus = this.statusIcons.on;
      this.checkAndNavigate();
    };

  }

  uploadSuccessful () {
    return (this.mapUploadStatus === this.statusIcons.on) && (this.payUploadStatus === this.statusIcons.on);
  }

  alertError () {
    window.alert('Invalid file. Could not parse.');
  }

  checkAndNavigate () {
    if (this.uploadSuccessful()) this.router.navigate(['map']);
  }


}
