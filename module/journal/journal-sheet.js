/**
 * Extend the basic JournalSheet with some very simple modifications
 * @extends {JournalSheet}
 */
export class jojoJournalSheet extends JournalSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["jojo", "sheet", "journal"],
        width: 520,
        height: 480,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
      });
    }
  
    /** @override */
    get template() {
      const path = "systems/jojo/templates/journal";
      // Return a single sheet for all journal types.
      // return `${path}/journal-sheet.html`;
  
      // Alternatively, you could use the following return statement to do a
      // unique journal sheet by type, like `weapon-sheet.html`.
      return `${path}/journal-${this.journal.data.type}-sheet.html`;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      const data = super.getData();
      return data;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    setPosition(options = {}) {
      const position = super.setPosition(options);
      const sheetBody = this.element.find(".sheet-body");
      const bodyHeight = position.height - 192;
      sheetBody.css("height", bodyHeight);
      return position;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
  
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return;
  
      // Roll handlers, click handlers, etc. would go here.
    }
    
  }
  