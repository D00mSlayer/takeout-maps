import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '.././local-storage.service'

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
  providers: [LocalStorageService]
})
export class FileUploadComponent implements OnInit {

  constructor(private router: Router, private localStorageService: LocalStorageService) {
    this.localStorageService.clearStorage();
  }

  ngOnInit(): void {
  }

  title = 'takeout-maps';

  upload (e:Event) {
    var target = e.target as HTMLInputElement;
    var files = target.files as FileList;
    var file = files[0];

    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = () => {
      var result = JSON.parse(reader.result as string);
      this.localStorageService.setItemToStorage(JSON.stringify(result));
      this.router.navigate(['map']);
    };

  }

}
