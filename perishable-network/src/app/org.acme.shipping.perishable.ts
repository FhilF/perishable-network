import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.acme.shipping.perishable{
   export enum ProductType {
      BANANAS,
      APPLES,
      PEARS,
      PEACHES,
      COFFEE,
   }
   export enum ShipmentStatus {
      CREATED,
      IN_TRANSIT,
      ARRIVED,
   }
   export abstract class ShipmentTransaction extends Transaction {
      shipment: Shipment;
   }
   export class TemperatureReading extends ShipmentTransaction {
      centigrade: number;
   }
   export class ShipmentReceived extends ShipmentTransaction {
   }
   export class ShipmentHasArrived extends Event {
      shipment: Shipment;
   }
   export class Shipment extends Asset {
      shipmentId: string;
      type: ProductType;
      status: ShipmentStatus;
      unitCount: number;
      temperatureReadings: TemperatureReading[];
      contract: Contract;
   }
   export class Contract extends Asset {
      contractId: string;
      grower: Grower;
      shipper: Shipper;
      importer: Importer;
      arrivalDateTime: Date;
      unitPrice: number;
      minTemperature: number;
      maxTemperature: number;
      minPenaltyFactor: number;
      maxPenaltyFactor: number;
   }
   export class Address {
      city: string;
      country: string;
      street: string;
      zip: string;
   }
   export abstract class Business extends Participant {
      email: string;
      address: Address;
      accountBalance: number;
   }
   export class Grower extends Business {
   }
   export class Shipper extends Business {
   }
   export class Importer extends Business {
   }
   export class OurSetupDemo extends Transaction {
   }
// }
