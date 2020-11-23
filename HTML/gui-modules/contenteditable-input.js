
"use strict";

//----------- Moduły NodeJs ------------//

// Moduły NodeJs:
const _       = require('lodash');
const $       = require('jquery');
const XRegExp = require('xregexp');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const webFonts = {};
const locale = {};

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'contenteditable-input.css');

//---------- Właściwa logika -----------/

/* Główna klasa aplikacji */
class ContenteditableInput{
    // --------------------- POTRZEBNE ZMIENNE:

    keyFilters = []
    validators = []

    // --------------------- OBSŁUGA EVENTÓW:

    // Wywołany dla eventu paste, usunie z testu całe formatowanie HTML.
    _jqOnPasteRemoveFormating(e){
        const obj = $(this).data('obj');
        const clipboardData = e.clipboardData || window.clipboardData || e.originalEvent.clipboardData;
        e.preventDefault();

        // Pobranie ze schowka tekstu i przepuszczenie go przez filtry znaków.
        const text = clipboardData.getData("text/plain");

        // Dodanie tekstu do diva.
        document.execCommand("insertHTML", false, text);
    }
    // Wywoływany dla eventu keydown, w celu walidacji jakie znaki zostawić.
    _jqOnKeypressValidate(e){
        const obj     = $(this).data('obj');
        const keyCode = e.which;
        const key     = String.fromCharCode(keyCode);
        const text    = $(this).text() + key;

        // Sprawdzenie czy wprowadzono dozwolony znak.
        for(const keyFilter of obj.keyFilters)
            if(keyFilter(key, keyCode))
                e.preventDefault();
    }
    // Wywoływany dla eventu input w celu walidacji wpisanych danych.
    _jqOnInputValidate(e){
        const jqObj = $(this);
        const text  = jqObj.text();
        const obj   = jqObj.data('obj');

        var isGood = true;
        for(const validator of obj.validators){
            if(validator(text) === false){
                isGood = false; break;
            }
        }
           
        // Jeśli obecna zawartość jest błędna:
        if(isGood == false){
            jqObj.addClass('invalid-input');
            //jqObj.text(obj.value);
        }
        else{
            jqObj.removeClass('invalid-input');
            // Zapisanie poprawnej wartości.
            obj.value = text;
        }
    }

    // --------------------- FUNKCIONALNOŚCI:
    

    // --------------------- BUDOWANIE GUI:

    _createContenteditableInput(options = {}){
        // Wartości domyślne.
        _.defaults(options, {
            value: '',
            enable: true,
            plainTextPaste: true,
            keyFilters: [],
            validators: ['numeric'],
        });

        // Zapisanie wartości początkowej.
        this.value = options.value;

        // Dodanie HTML.
        this.jqContenteditableInput = $(
            `<div class="contenteditable-input" contenteditable>${options.value}</div>`
        );
        // Zapisanie referencji na obiekt.
        this.jqContenteditableInput.data('obj', this);

        // Wykrywacze typów znaków.
        const keyDetectors = {
            'any':      (char, code)=>{ return true; },
            'endl':     (char, code)=>{ return code === 13; },
            'number':   (char, code)=>{ return /[\d]/.test(char); },
            'letter':   (char, code)=>{ return XRegExp('[\\pL\\pM*]').test(char); },
            'white':    (char, code)=>{ return /[\s]/.test(char); }
        }
        // Walidatory treści.
        const contentValidators = {
            'numeric':  (text)=>{ console.log(text); return !isNaN(text); },
        }

        // Obsługa opcji.
        if(options.enable === false) this.disable();
        for(const keyFilterName of options.keyFilters){
            // Nazwa filtra może mieć ! na początku by odwrócić wynik filtracji.
            const [, inverted, detector] = keyFilterName.match(/^(!)*([a-zA-Z]*)$/);
            
            const keyDetector = keyDetectors[detector];
            if(keyDetector === undefined)
                throw Error(`Unknown filter name "${detector}"!`);
            
            if(inverted !== undefined)
                this.keyFilters.push((char,code)=>{ return !keyDetector(char, code); });
            else
                this.keyFilters.push(keyDetector);
        }
        for(const validatorNameOrFunction of options.validators){
            if(typeof validatorNameOrFunction === "string"){
                const validatorName = validatorNameOrFunction;
                // Nazwa walidatora może mieć ! na początku by odwrócić wynik walidacji.
                const [, inverted, validator] = validatorName.match(/^(!)*([a-zA-Z]*)$/);
                
                const contentValidator = contentValidators[validator];
                if(contentValidator === undefined)
                    throw Error(`Unknown validator name "${validator}"!`);
                
                if(inverted !== undefined)
                    this.validators.push((text)=>{ return !contentValidator(text); });
                else
                    this.validators.push(contentValidator);
            }
            else{
                const validatorFun = validatorNameOrFunction;
                this.validators.push(validatorFun);
            }
        }

        // Obsługa eventów.
        this.jqContenteditableInput.on('keypress', this._jqOnKeypressValidate);
        this.jqContenteditableInput.on('input', this._jqOnInputValidate);
        if(options.plainTextPaste)
            this.jqContenteditableInput.on('paste', this._jqOnPasteRemoveFormating);
    }

    // --------------------- FUNKCJE API:


    // --------------------- INNE:

    // Dodaje do diva wartość contenteditable.
    enable(){
        this.jqContenteditableInput.removeClass('disabled');
        this.jqContenteditableInput.prop('contenteditable', true);
    }
    // Usuwa z diva wartość contenteditable.
    disable(){
        this.jqContenteditableInput.addClass('disabled');
        this.jqContenteditableInput.prop('contenteditable', false);
    }

    constructor(options = {}){
        // Budowanie GUI.
        this._createContenteditableInput(options);
    }

    // Zwraca obiekt jQuery.
    getJQ(){
        return this.jqContenteditableInput;
    }
}

//-------------- Export -------------//

module.exports = ContenteditableInput;