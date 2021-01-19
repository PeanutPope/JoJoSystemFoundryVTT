/**
 * Extend the basic Journal with some very simple modifications.
 * @extends {Journal}
 */
export class jojoJournal extends Journal {
    /**
     * Augment the basic Journal data model with additional dynamic data.
     */
    prepareData() {
      super.prepareData();
  
      // Get the Journal's data
      const journalData = this.data;
      const actorData = this.actor ? this.actor.data : {};
      const data = journalData.data;
    }
  
    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
      // Basic template rendering data
      const token = this.actor.token;
      const journal = this.data;
      const actorData = this.actor ? this.actor.data.data : {};
      const journalData = journal.data;
  
      let roll = new Roll('d20+@abilities.str.mod', actorData);
      let label = `Rolling ${journal.name}`;
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
    
  }
  