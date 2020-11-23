"use strict";

//----------- Moduły NodeJs ------------//

const $       = require('jquery');
const Popper  = require('popper.js');
const Tooltip = require('tooltip.js');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const locale   = {}
const webFonts = {}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'context-menu.css');

//---------- Właściwa logika -----------/

class ContextMenu{
    // Inicializuje klasę przy tworzeniu pierwszego obiektu.
    static _initClass(){
        // Tworzy niewidzialny obiekt do którego jest doczepiany popper.js.
        ContextMenu._contextMenuOrgin = $(
            '<div style="position: absolute; visibility: hidden;">');
        $('body').append(ContextMenu._contextMenuOrgin);

        // Informacja o obecnie otwartym menu kontekstowy.
        ContextMenu._activeContextMenu = null;
        $(document).mouseup(function(e){
            if($('.ctx-menu:hover').length === 0) {
                if(ContextMenu._activeContextMenu !== null)
                    ContextMenu._activeContextMenu._hide();
            };
        });

        // Ukrywanie menu przy zmianie stanu okienka.
        $(window).on('resize', function(){
            if(ContextMenu._activeContextMenu !== null)
                ContextMenu._activeContextMenu._hide();
        });
        $(window).on('blur', function(){
            if(ContextMenu._activeContextMenu !== null)
                ContextMenu._activeContextMenu._hide();
        });
        
        // Zatwierdzenie inicializacji.
        ContextMenu._isInitialized = true;
    }

    // Aktualizuje to które opcje można
    // obecnie kliknąć.
    _validateOptions(){
        this.ctxOptions.forEach((option)=>{
            if(option.validator(this.clickedObj))
                option.jqOption.enable();
            else
                option.jqOption.disable();
        });
    }
    // Pokazuje menu.
    _show(){
        // Blokowanie i pokazywanie odpowiednich opcji.
        // (wg wartości zwracanych przez walidator)
        this._validateOptions();

        // Reszta operacji.
        this.jqContextMenu.css('display', 'block');
        ContextMenu._activeContextMenu = this;
    }
    // Ukrywa menu.
    _hide(){
        this.jqContextMenu.css('display', 'none');
        ContextMenu._activeContextMenu = null;
    }

    // Budowa wewnętrznej części HTML-a menu.
    _createContextMenu(options = []){
        // Główny div menu kontekstowego.
        var jqContextMenu = $(
            '<div class="ctx-menu" style="display: none;">'
        );

        this.ctxOptions = [];

        // Opcje w menu kontekstowym.
        // Click jest wywoływany argumentami:
        // - Obiekt DOM na którym otwarto menu kontekstowe.
        var obj = this;
        options.forEach((option)=>{
            var jqOption = $(`<button class="ctx-menu-label">${option.label}</button>`);

			// Przydatne funkcje.
			jqOption.enable = ()=>{
				jqOption.prop('disabled', false);
			}
			jqOption.disable = ()=>{
				jqOption.prop('disabled', true);
			}

            // Obsługa klikniecia.
            jqOption.click(()=>{
                // Ukrycie menu:
                obj._hide();  

                // Callback:
                if(option.click !== undefined)
                    option.click(obj.clickedObj);
                else
                    console.log('Empty context menu click callback.');    
            });

            // Dopisanie do GUI.
            jqContextMenu.append(jqOption);

            // Zapisanie opcji.
            obj.ctxOptions.push(_.defaults(option, {
                "jqOption": jqOption,
                "validator": ()=>{ return true; },
                "validateOn": [],
            }));
        });
        return jqContextMenu;
    }

    constructor(options){
        if(ContextMenu._isInitialized === undefined)
            ContextMenu._initClass();

        // Przygotowanie menu.
        this.jqContextMenu = this._createContextMenu(options);
        $('body').append(this.jqContextMenu);

        // Przygotowanie poppera.
        this.popper = new Popper(
            ContextMenu._contextMenuOrgin,
            this.jqContextMenu, { placement: 'auto-end' }
        );
    }

    // Dopisuje obiekt na któym można wywołać menu kotekstowe.
    addListener(jqTarget){
        var obj = this;
        // Ukrycie aktywnych menu i pokazanie tego.
        jqTarget.contextmenu(function(e){
            // Ukrycie widocznego obecnie menu:
            if(ContextMenu._activeContextMenu !== null)
                ContextMenu._activeContextMenu._hide();

            // Przesunięcie niewidzialnego środka menu kontekstowego w odpowiednie miejsce.
            ContextMenu._contextMenuOrgin.css({ left: e.pageX + 'px', top:  e.pageY + 'px' });

            // Zachowanie referencji na obiekt kliknięty:
            obj.clickedObj = $(this);

            // Update GUI i zapisanie widocznego menu:
            obj.popper.scheduleUpdate();
            obj._show();

            // Zatrzymanie propagacji eventów typu contextmenu.
            // (wyświetli się pierwszy napotkany)
            e.stopPropagation();
        });

        var obj = this;

        // Dodanie walidacji zalerznej od zdarzeń na obiekcie,
        // na rzecz którego obecnie jest wywołane menu kontekstowe.
        this.ctxOptions.forEach((option)=>{
            option.validateOn.forEach((onEvent)=>{
                jqTarget.on(onEvent, function(){
                    var jqObj = $(this);
                    if(jqObj.is(obj.clickedObj)){
                        if(option.validator(jqObj))
                            option.jqOption.enable();
                        else
                            option.jqOption.disable();
                    }
                });
            });
        });
    }
}

//-------------- Export -------------//

module.exports = ContextMenu;