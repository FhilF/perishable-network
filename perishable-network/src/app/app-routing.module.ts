/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';

import { ShipmentComponent } from './Shipment/Shipment.component';
import { ContractComponent } from './Contract/Contract.component';

import { GrowerComponent } from './Grower/Grower.component';
import { ShipperComponent } from './Shipper/Shipper.component';
import { ImporterComponent } from './Importer/Importer.component';

import { TemperatureReadingComponent } from './TemperatureReading/TemperatureReading.component';
import { ShipmentReceivedComponent } from './ShipmentReceived/ShipmentReceived.component';
import { OurSetupDemoComponent } from './OurSetupDemo/OurSetupDemo.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Shipment', component: ShipmentComponent },
  { path: 'Contract', component: ContractComponent },
  { path: 'Grower', component: GrowerComponent },
  { path: 'Shipper', component: ShipperComponent },
  { path: 'Importer', component: ImporterComponent },
  { path: 'TemperatureReading', component: TemperatureReadingComponent },
  { path: 'ShipmentReceived', component: ShipmentReceivedComponent },
  { path: 'OurSetupDemo', component: OurSetupDemoComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule],
 providers: []
})
export class AppRoutingModule { }
