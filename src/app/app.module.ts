import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatSliderModule } from '@angular/material/slider';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { InteractiveMapComponent } from './interactive-map/interactive-map.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LocalStorageService } from './local-storage.service';
import { LocationServiceService } from './location-service.service';
import { AllMaterialModules } from './all-material/all-material.module';

// import { LeafletMarkerClusterModule } from "@asymmetrik/ngx-leaflet-markercluster";


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
    // LeafletMarkerClusterModule.forRoot()
  ],
  exports: [
    // MatInputModule,
    // MatSelectModule
  ],
  providers: [
    LocalStorageService,
    LocationServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
