/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {org.acme.shipping.perishable.OurSetupDemo} ourSetupDemo - the SetupDemo transaction
 * @transaction
 */
async function ourSetupDemo(ourSetupDemo) {  // eslint-disable-line no-unused-vars

    var factory = getFactory();
    var NS = 'org.acme.shipping.perishable';

    // create the Grower
    var grower = factory.newResource(NS, 'Grower', 'farmer1@email.com');
    var growerAddress = factory.newConcept(NS, 'Address');
    growerAddress.country = 'USA';
    grower.address = growerAddress;
    grower.accountBalance = 0;

    var grower2 = factory.newResource(NS, 'Grower', 'farmer2@email.com');
    var grower2Address = factory.newConcept(NS, 'Address');
    grower2Address.country = 'USA';
    grower2.address = grower2Address;
    grower2.accountBalance = 0;

    var grower3 = factory.newResource(NS, 'Grower', 'farmer3@email.com');
    var grower3Address = factory.newConcept(NS, 'Address');
    grower3Address.country = 'USA';
    grower3.address = grower3Address;
    grower3.accountBalance = 0;

    // create the Importer
    var importer = factory.newResource(NS, 'Importer', 'importer1@email.com');
    var importerAddress = factory.newConcept(NS, 'Address');
    importerAddress.country = 'USA';
    importer.address = importerAddress;
    importer.accountBalance = 10000;

    //create the Shipper
    var shipper = factory.newResource(NS, 'Shipper', 'shipper1@email.com');
    var shipperAddress = factory.newConcept(NS, 'Address');
    shipperAddress.country = 'USA';
    shipper.address = shipperAddress;
    shipper.accountBalance = 10000;

    

    // create the Contract

    var contract = factory.newResource(NS, 'Contract', 'CON_002');
    contract.grower = factory.newRelationship(NS, 'Grower', 'farmer1@email.com');
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'shipper1@email.com');
    contract.importer = factory.newRelationship(NS, 'Importer', 'importer1@email.com');
    var tommorow = ourSetupDemo.timestamp;
    tommorow.setDate(tommorow.getDate() + 1);
    contract.arrivalDateTime = tommorow;
    contract.unitPrice = 0.5;
    contract.minTemperature = 2;
    contract.maxTemperature = 10;
    contract.minPenaltyFactor = 0.2;
    contract.maxPenaltyFactor = 0.1;

    // create the Shipment

    var shipment = factory.newResource(NS, 'Shipment', 'SHIP_002');
    shipment.type = 'BANANAS';
    shipment.status = 'IN_TRANSIT';
    shipment.unitCount = 5000;
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CON_002');

    // A bunch of Javascript Promises

    
    const growerRegistry = await getParticipantRegistry(NS + '.Grower');
    await growerRegistry.addAll([grower, grower2, grower3]);

    // add the importers
    const importerRegistry = await getParticipantRegistry(NS + '.Importer');
    await importerRegistry.addAll([importer]);

    // add the shippers
    const shipperRegistry = await getParticipantRegistry(NS + '.Shipper');
    await shipperRegistry.addAll([shipper]);

    // add the contracts
    const contractRegistry = await getAssetRegistry(NS + '.Contract');
    await contractRegistry.addAll([contract]);

    // add the shipments
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment');
    await shipmentRegistry.addAll([shipment]);


}


/**
 * A temperature reading on one of the perishable shipments
 * @param {org.acme.shipping.perishable.TemperatureReading} temperatureReading
 * @transaction
 */

 async function temperatureReading(temperatureReading){

    var shipment = temperatureReading.shipment;
    console.log('Adding temperature of ' + temperatureReading.centigrade + 'to shipment');

    if (shipment.temperatureReadings){
        shipment.temperatureReadings.push(temperatureReading);
    }else {
        shipment.temperatureReadings = [temperatureReading];
    }

    return getAssetRegistry('org.acme.shipping.perishable.Shipment')
        .then(function (shipmentRegistry){
            return shipmentRegistry.update(shipment);
        });

 }


/**
  * A shipent has been received and fund needs to be allocated
  * @param {org.acme.shipping.perishable.ShipmentReceived} shipmentReceived
  * @transaction
  */

async  function shipmentReceived(shipmentReceived) {

    const contract = shipmentReceived.shipment.contract;
    const shipment = shipmentReceived.shipment;
    let money = contract.unitPrice * shipment.unitCount;

    console.log('Received at: ' + shipmentReceived.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arrivalDateTime);

    // set the status of the shipment
    shipment.status = 'ARRIVED';

    // if the shipment did not arrive on time the Money is zero
    if (shipmentReceived.timestamp > contract.arrivalDateTime) {
        money = 0;
        console.log('Late shipment');
    } else {
        // find the lowest temperature reading
        if (shipment.temperatureReadings) {
            // sort the temperatureReadings by centigrade
            shipment.temperatureReadings.sort(function (a, b) {
                return (a.centigrade - b.centigrade);
            });
            const lowestReading = shipment.temperatureReadings[0];
            const highestReading = shipment.temperatureReadings[shipment.temperatureReadings.length - 1];
            let penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.centigrade);
            console.log('Highest temp reading: ' + highestReading.centigrade);

            // does the lowest temperature violate the contract?
            if (lowestReading.centigrade < contract.minTemperature) {
                penalty += (contract.minTemperature - lowestReading.centigrade) * contract.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }

            // does the highest temperature violate the contract?
            if (highestReading.centigrade > contract.maxTemperature) {
                penalty += (highestReading.centigrade - contract.maxTemperature) * contract.maxPenaltyFactor;
                console.log('Max temp penalty: ' + penalty);
            }

            // apply any penalities
            money -= (penalty * shipment.unitCount);

            if (money < 0) {
                money = 0;
            }
        }
    }

    console.log('money: ' + money);
    contract.grower.accountBalance += money;
    contract.importer.accountBalance -= money;

    console.log('Grower: ' + contract.grower.$identifier + ' new balance: ' + contract.grower.accountBalance);
    console.log('Importer: ' + contract.importer.$identifier + ' new balance: ' + contract.importer.accountBalance);

    // update the grower's balance
    const growerRegistry = await getParticipantRegistry('org.acme.shipping.perishable.Grower');
    await growerRegistry.update(contract.grower);

    // update the importer's balance
    const importerRegistry = await getParticipantRegistry('org.acme.shipping.perishable.Importer');
    await importerRegistry.update(contract.importer);

    // update the state of the shipment
    const shipmentRegistry = await getAssetRegistry('org.acme.shipping.perishable.Shipment');
    var shipmentNotification = getFactory().newEvent('org.acme.shipping.perishable', 'Shipment has arrived');
    shipmentNotification.shipment = shipment;
    emit(shipmentNotification);
    await shipmentRegistry.update(shipment);

  }


  