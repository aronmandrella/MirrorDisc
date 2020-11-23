"use strict";

//----------- Moduły NodeJs ------------//

const $ = require('jquery');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const locale   = {}
const webFonts = {}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'basic-appbar.css');

//---------- Właściwa logika -----------/

class BasicAppbar{
    // Tworzy appbar. Możliwe parametry: icon, text, key, classes i click.
	// Callback click jest wywoływany argumentm jqButton,  i obiektem z buttonami
	// z wartościami key przypisanymi do kluczy.
	_createAppbar(params = []){
		if(!(params instanceof Array))
			throw Error("params must be Array of button settings.");

		var obj = this;
		var jqAppbar = $('<div class="basic-appbar"></div>');

		this.keyedButtons = {};

		params.forEach(function(buttonParams){
            // Przygotowanie zawartości guzika.
			var icon = ''; var text = ''; var attrs = ''; var classes = '';
			if (buttonParams.icon !== undefined) 
				icon = '<div class="basic-appbar-button-icon">' + buttonParams.icon + '</div>';
			if (buttonParams.text !== undefined) 
				text = '<div class="basic-appbar-button-text">' + buttonParams.text + '</div>';
			if (buttonParams.key !== undefined) {
				attrs = ' data-key="' + buttonParams.key + '" ';
			}	
			if (buttonParams.classes !== undefined) 
				classes = buttonParams.classes;

			var jqButton = $(
                `<button class="basic-appbar-button ${classes}" ${attrs}>${icon}${text}</button>`);
			
			jqButton.onenable = buttonParams.onenable;
			jqButton.ondisable = buttonParams.ondisable;

			// Przydatne funkcje.
			jqButton.enable = ()=>{
				jqButton.prop('disabled', false);
				if(jqButton.onenable !== undefined)
					jqButton.onenable(jqButton, obj.keyedButtons);
			}
			jqButton.disable = ()=>{
				jqButton.prop('disabled', true);
				if(jqButton.ondisable !== undefined)
					jqButton.ondisable(jqButton, obj.keyedButtons);
			}

			// Domyślny stan.
			if(buttonParams.enabled === false){
				jqButton.disable();
			}
			else {
				jqButton.enable();
			}
	
			// Zachowanie do tablicy.
			if (buttonParams.key !== undefined) {
				this.keyedButtons[buttonParams.key] = jqButton;
			}	

			// Podpiecie eventu klikniecia.
			if (buttonParams.click !== undefined)
				jqButton.click(function(){ buttonParams.click($(this), obj.keyedButtons); });
                
			// Dodanie guzika do toolbara.
			jqAppbar.append(jqButton);

		}, this);

		return jqAppbar;
	}

	getButton(key){
		return this.keyedButtons[key];
	}

    constructor(params){
        // Przygotowanie appbara.
        this.jqAppbar = this._createAppbar(params);
    }

    // Zwra obiekt jQuery.
    getJQ(){
        return this.jqAppbar;
    }
}

//-------------- Export -------------//

module.exports = BasicAppbar;