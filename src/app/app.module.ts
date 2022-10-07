import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LocalStorageService } from './local-storage.service';
import { LocationServiceService } from './location-service.service';
import { AllMaterialModules } from './all-material/all-material.module';



@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    InteractiveMapComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AllMaterialModules,
    LeafletModule,
  ],
  exports: [
  ],
  providers: [
    LocalStorageService,
    LocationServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
