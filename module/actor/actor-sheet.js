/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class jojoActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, { 
      classes: ["jojo", "sheet", "actor"],
      template: "systems/jojo/templates/actor/actor-sheet.html",
      width: 600,
      height: 1000,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
      

    });
  }

  /* -------------------------------------------- */


  /** @override */
  getData() {
    const data = super.getData();
     
    // Use a safe clone of the actor data for further operations.
    const actorData = data.actor.data;
    const isOwner = this.document.isOwner;
    const isEditable = this.isEditable;
    //const data = foundry.utils.deepClone(this.object);


    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    // Prepare items.
    if (actorData.type == 'character') {
      this._prepareCharacterItems(data);
     // this._prepareCharacterData(data);
    }
    
    // Add roll data for TinyMCE editors.
    data.rollData = data.actor.getRollData();

    // Prepare active effects
    //data.effects = prepareActiveEffectCategories(this.actor.effects);
    
    return data;
  }


  
  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const features = [];
    const villainousaction = [];
    const trait = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      //let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to traits.
      else if (i.type === 'trait') {
        trait.push(i);
      }
      
      // Append to villainous actions.
      else if (i.type === 'villainousaction') {
        villainousaction.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.features = features;
    actorData.trait = trait;
    actorData.villainousaction = villainousaction;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId")); // FUNKTIONIERT
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
    li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.document.isowner) { //changed from actor.owner to document.isowner
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]); //FUNKTIONIERT IN 0.8 ABER NICHT IN 0.9
  }

  
  /** @override */

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = await new Roll(dataset.roll, this.actor.data.data).evaluate();
      console.log("Rolling Dice ...");
      console.log(roll);
      //roll.evaluate();
      roll.toMessage(
        {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        //flavor: label
      }
      );
      

      //let label = dataset.label ? `Rolling ${dataset.label}` : '';
      //roll.evaluate({async: false}); //Doesnt work
  }
  }


  async _updateObject(ev, formData) {
    const newFormData = {...formData};
    console.log("event",ev);
    console.log("formData",formData);


    if (newFormData['data.hasstand'] == true) {

      newFormData['data.nostand'] = false;
      
        console.log("Has a Stand");
    }
    else if (newFormData['data.hasstand'] == false) {

      newFormData['data.nostand'] = true;
      
        console.log("Doesn't have a Stand");
    }


    if (newFormData['data.isvillain'] == true) {

      newFormData['data.notvillain'] = false;
      
        console.log("Is a villain");
    }
    else if (newFormData['data.isvillain'] == false) {

      newFormData['data.notvillain'] = true;
      
        console.log("Is not a villain");
    }


    if (newFormData['data.typenumber1'] == false) {

      newFormData['data.rtypenumber1'] = true;
      
        console.log("Has 1 Char Type");
    }
    else if (newFormData['data.typenumber1'] == true) {

      newFormData['data.rtypenumber1'] = false;
      
        console.log("Has 2 Char Types");
    }

    if (newFormData['data.typenumber2'] == false) {

      newFormData['data.rtypenumber2'] = true;
      
    }
    else if (newFormData['data.typenumber2'] == true) {

      newFormData['data.rtypenumber2'] = false;
      
        console.log("Has 3 Char Types");
    }


    if (newFormData['data.standtypenumber1'] == false) {

      newFormData['data.rstandtypenumber1'] = true;
      
        console.log("Has 1 Stand Type");
    }
    else if (newFormData['data.standtypenumber1'] == true) {

      newFormData['data.rstandtypenumber1'] = false;
      
        console.log("Has 2 Stand Types");
    }
    if (newFormData['data.standtypenumber2'] == false) {

      newFormData['data.rstandtypenumber2'] = true;
      
    }
    else if (newFormData['data.standtypenumber2'] == true) {

      newFormData['data.rstandtypenumber2'] = false;
      
        console.log("Has 3 Stand Types");
    }


    if (newFormData['data.attributes.brains.value'] == 1) {

      newFormData['data.plot.max'] = newFormData['data.attributes.brains.value'];
    }
    else if (newFormData['data.attributes.brains.value'] == 2) {

      newFormData['data.plot.max'] = newFormData['data.attributes.brains.value'];
    }
    else if (newFormData['data.attributes.brains.value'] == 3) {

      newFormData['data.plot.max'] = newFormData['data.attributes.brains.value'];
    }
    else if (newFormData['data.attributes.brains.value'] == 4) {

      newFormData['data.plot.max'] = newFormData['data.attributes.brains.value'];
    }
    else if (newFormData['data.attributes.brains.value'] == 5) {

      newFormData['data.plot.max'] = newFormData['data.attributes.brains.value'];
    }
    //console.log(newFormData['data.plot.max']);
    //console.log(newFormData['data.attributes.brains.value']);

    if (newFormData['data.attributes.bravery.value'] == 1) {

      newFormData['data.resolve.max'] = newFormData['data.attributes.bravery.value'];
    }
    else if (newFormData['data.attributes.bravery.value'] == 2) {

      newFormData['data.resolve.max'] = newFormData['data.attributes.bravery.value'];
    }
    else if (newFormData['data.attributes.bravery.value'] == 3) {

      newFormData['data.resolve.max'] = newFormData['data.attributes.bravery.value'];
    }
    else if (newFormData['data.attributes.bravery.value'] == 4) {

      newFormData['data.resolve.max'] = newFormData['data.attributes.bravery.value'];
    }
    else if (newFormData['data.attributes.bravery.value'] == 5) {

      newFormData['data.resolve.max'] = newFormData['data.attributes.bravery.value'];
    }
    

    if (newFormData['data.standstats.stats.power.modifier'] == 1) {

      newFormData['data.standstats.stats.power.dice'] = "1d6"
      
        console.log("Power is E rank!");
    }
    else if (newFormData['data.standstats.stats.power.modifier'] == 2) {

      newFormData['data.standstats.stats.power.dice'] = "2d6k1"
      
        console.log("Power is D rank!");
    }
    else if (newFormData['data.standstats.stats.power.modifier'] == 3) {
      
      newFormData['data.standstats.stats.power.dice'] = "2d6"
      
        console.log("Power is C rank!");
    }
    else if (newFormData['data.standstats.stats.power.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.power.dice'] = "3d6k2"
      
        console.log("Power is B rank!");
    }
    else if (newFormData['data.standstats.stats.power.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.power.dice'] = "3d6"
      
        console.log("Power is A rank!");
    }

    
    
    if (newFormData['data.standstats.stats.speed.modifier'] == 1) {

      newFormData['data.standstats.stats.speed.dice'] = "1d6"
      newFormData['data.standstats.stats.speed.distance'] = 5
      
        console.log("speed is E rank!");
    }
    else if (newFormData['data.standstats.stats.speed.modifier'] == 2) {

      newFormData['data.standstats.stats.speed.dice'] = "2d6k1"
      newFormData['data.standstats.stats.speed.distance'] = 30
      
        console.log("speed is D rank!");
    }
    else if (newFormData['data.standstats.stats.speed.modifier'] == 3) {
      
      newFormData['data.standstats.stats.speed.dice'] = "2d6"
      newFormData['data.standstats.stats.speed.distance'] = 65
      
        console.log("speed is C rank!");
    }
    else if (newFormData['data.standstats.stats.speed.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.speed.dice'] = "3d6k2"
      newFormData['data.standstats.stats.speed.distance'] = 100
      
        console.log("speed is B rank!");
    }
    else if (newFormData['data.standstats.stats.speed.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.speed.dice'] = "3d6"
      newFormData['data.standstats.stats.speed.distance'] = 165
      
        console.log("speed is A rank!");
    }
    
    
    
    if (newFormData['data.standstats.stats.precision.modifier'] == 1) {

      newFormData['data.standstats.stats.precision.dice'] = "1d6"
      
        console.log("precision is E rank!");
    }
    else if (newFormData['data.standstats.stats.precision.modifier'] == 2) {

      newFormData['data.standstats.stats.precision.dice'] = "2d6k1"
      
        console.log("precision is D rank!");
    }
    else if (newFormData['data.standstats.stats.precision.modifier'] == 3) {
      
      newFormData['data.standstats.stats.precision.dice'] = "2d6"
      
        console.log("precision is C rank!");
    }
    else if (newFormData['data.standstats.stats.precision.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.precision.dice'] = "3d6k2"
      
        console.log("precision is B rank!");
    }
    else if (newFormData['data.standstats.stats.precision.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.precision.dice'] = "3d6"
      
        console.log("precision is A rank!");
    }
    
    
    
    if (newFormData['data.standstats.stats.durability.modifier'] == 1) {

      newFormData['data.standstats.stats.durability.dice'] = "1d6"
      
        console.log("durability is E rank!");
    }
    else if (newFormData['data.standstats.stats.durability.modifier'] == 2) {

      newFormData['data.standstats.stats.durability.dice'] = "2d6k1"
      
        console.log("durability is D rank!");
    }
    else if (newFormData['data.standstats.stats.durability.modifier'] == 3) {
      
      newFormData['data.standstats.stats.durability.dice'] = "2d6"
      
        console.log("durability is C rank!");
    }
    else if (newFormData['data.standstats.stats.durability.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.durability.dice'] = "3d6k2"
      
        console.log("durability is B rank!");
    }
    else if (newFormData['data.standstats.stats.durability.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.durability.dice'] = "3d6"
      
        console.log("durability is A rank!");
    }
    
    
    
    if (newFormData['data.standstats.stats.learning.modifier'] == 1) {

      newFormData['data.standstats.stats.learning.dice'] = "1d6"
      
        console.log("learning is E rank!");
    }
    else if (newFormData['data.standstats.stats.learning.modifier'] == 2) {

      newFormData['data.standstats.stats.learning.dice'] = "2d6k1"
      
        console.log("learning is D rank!");
    }
    else if (newFormData['data.standstats.stats.learning.modifier'] == 3) {
      
      newFormData['data.standstats.stats.learning.dice'] = "2d6"
      
        console.log("learning is C rank!");
    }
    else if (newFormData['data.standstats.stats.learning.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.learning.dice'] = "3d6k2"
      
        console.log("learning is B rank!");
    }
    else if (newFormData['data.standstats.stats.learning.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.learning.dice'] = "3d6"
      
        console.log("learning is A rank!");
    }
    
    
    
    if (newFormData['data.standstats.stats.range.modifier'] == 1) {

      newFormData['data.standstats.stats.range.dice'] = "1d6"
      newFormData['data.standstats.stats.range.distance'] = 5
      
        console.log("range is E rank!");
    }
    else if (newFormData['data.standstats.stats.range.modifier'] == 2) {

      newFormData['data.standstats.stats.range.dice'] = "2d6k1"
      newFormData['data.standstats.stats.range.distance'] = 30
      
        console.log("range is D rank!");
    }
    else if (newFormData['data.standstats.stats.range.modifier'] == 3) {
      
      newFormData['data.standstats.stats.range.dice'] = "2d6"
      newFormData['data.standstats.stats.range.distance'] = 65
      
        console.log("range is C rank!");
    }
    else if (newFormData['data.standstats.stats.range.modifier'] == 4) { 
      
      newFormData['data.standstats.stats.range.dice'] = "3d6k2"
      newFormData['data.standstats.stats.range.distance'] = 165
      
        console.log("range is B rank!");
    }
    else if (newFormData['data.standstats.stats.range.modifier'] == 5) { 
      
      newFormData['data.standstats.stats.range.dice'] = "3d6"
      newFormData['data.standstats.stats.range.distance'] = 330
      
        console.log("range is A rank!");
    }
   

    
    super._updateObject(ev, newFormData);
    console.log("New Form Data",newFormData); //both formdata and newformdate are updated
  }
  
  
  
}
