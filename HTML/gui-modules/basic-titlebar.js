"use strict";

//----------- Moduły NodeJs ------------//

const $ = require('jquery');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const locale   = {}
const webFonts = {
    minimize: '<i class="far fa-window-minimize"></i>',
	maximize: '<i class="far fa-window-maximize"></i>',
	restore: '<i class="far fa-window-restore"></i>',
	close: '<i class="fas fa-times"></i>',
}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'basic-titlebar.css');

//---------- Właściwa logika -----------/

class BasicTitlebar{
    win = require('electron').remote.getCurrentWindow()

    // --------------- OBSŁUGA EVENTÓW:

    _onMinimize(){
        this.win.minimize();
    }
    _onMaximize(){
        this.win.maximize();
    }
    _onRestore(){
        this.win.restore();
    }

    _onAfterClose(){
        this.onClose();
        this.win.close();
    }
    _onAfterMaximize(){
        this.jqTitlebar.find('button[data-action="restore"]').css('display', 'block');
        this.jqTitlebar.find('button[data-action="maximize"]').css('display', 'none');
    }
    _onAfterRestore(){
        this.jqTitlebar.find('button[data-action="restore"]').css('display', 'none');
        this.jqTitlebar.find('button[data-action="maximize"]').css('display', 'block');
    }
    _onAfterFocus(){
        this.jqTitlebar.attr('data-window-focused', true);
    }
    _onAfterBlur(){
        this.jqTitlebar.attr('data-window-focused', false);
    }

    // Można nadpisać.
    onClose(){}

    // --------------- BUDOWANIE GUI:

	_createTitleBar(){
        var buttonsToAdd = [];
        if(this.win.isMinimizable())
            buttonsToAdd.push(`<button class="basic-titlebar-button" data-action="minimize">${webFonts.minimize}</button>`);
        if(this.win.isMaximizable()){
            buttonsToAdd.push(`<button class="basic-titlebar-button" data-action="maximize">${webFonts.maximize}</button>`);
            buttonsToAdd.push(`<button class="basic-titlebar-button" data-action="restore">${webFonts.restore}</button>`);
        }
        if(this.win.isClosable())
            buttonsToAdd.push(`<button class="basic-titlebar-button" data-action="close">${webFonts.close}</button>`);

		// Przygotowanie HTML-a.
		var jqTitlebar = $(
            `<div class="basic-titlebar">
                <div class="basic-titlebar-drag-area">
                    <div class="basic-titlebar-icon"></div>
                    <div class="basic-titlebar-text" class="ellipsis-text-line">
                        <span class="basic-titlebar-title"></span>
                        <span class="basic-titlebar-info"></span>
                    </div>
                </div>
                <div class="basic-titlebar-window-buttons"></div>
            </div>`
		);
        buttonsToAdd.forEach((button)=>{
            jqTitlebar.find('.basic-titlebar-window-buttons').append(button);
        })

		// Podpięcie obsługi eventów.
		var obj = this;
		jqTitlebar.find('button[data-action="minimize"]').click((function(){ obj._onMinimize(); }));
		jqTitlebar.find('button[data-action="maximize"]').click(function(){ obj._onMaximize(); });
		jqTitlebar.find('button[data-action="restore"]').click(function(){ obj._onRestore(); });
        jqTitlebar.find('button[data-action="close"]').click(function(){
            jqTitlebar.find('button').prop('disabled', true); // Wyłączenie guzików.
            obj._onAfterClose();
        });
  
        return jqTitlebar;
	}
    constructor(){
        this.jqTitlebar = this._createTitleBar();

        // Inicializacja.
        if(this.win.isMaximized())
            this._onAfterMaximize();
        else
            this._onAfterRestore();
        if(this.win.isFocused())
            this._onAfterFocus();
        else
            this._onAfterBlur();

        // Nasłuchiwanie eventów okienka.
        this.eventHandlers = [
            ['unmaximize',  ()=>{this._onAfterRestore();}],
            ['maximize',    ()=>{this._onAfterMaximize();}],
            ['focus',       ()=>{this._onAfterFocus();}],
            ['blur',        ()=>{this._onAfterBlur();}],
        ];
        for(const handlerData of this.eventHandlers)
            this.win.on(...handlerData);
    }

    // --------------- FUNKCJE API:

    // Usuwa ustawione dla win eventHanldery. Nalerzy wywołać,
    // przy zamykaniu okienka z titlebarem.
    clearEventHandlers(){
        for(const handlerData of this.eventHandlers)
            this.win.off(...handlerData);
    }

    setTitlebarTitle(html){
		this.jqTitlebar.find('.basic-titlebar-title').html(html);
    }
    setTitlebarInfo(html){
		this.jqTitlebar.find('.basic-titlebar-info').html(html);
    }
    setTitlebarIcon(html){
		this.jqTitlebar.find('.basic-titlebar-icon').html(html);
    }
     
    // Zwra obiekt jQuery.
    getJQ(){
        return this.jqTitlebar;
    }
}

//-------------- Export -------------//

module.exports = BasicTitlebar;