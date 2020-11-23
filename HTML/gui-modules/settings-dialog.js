
"use strict";

//----------- Moduły NodeJs ------------//

// Moduły NodeJs:
const _  = require('lodash');
const $  = require('jquery');
const os = require('os');

//------------- Moduły gui -------------//

const gui             = require('./_gui-module');
const BasicCheckbox   = require('./basic-checkbox');

//---------- Tekst i webfony -----------/

var webFonts = {
    'linux': '<i class="fab fa-linux"></i>',
    'macOS': '<i class="fab fa-apple"></i>',
    'windows': '<i class="fab fa-windows"></i>',
};
var locale = {}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'settings-dialog.css');

//---------- Funkcje utility -----------/

// Usuwa formatowanie z tekstu dla wklejania do obiektów contenteditable.
const contentEditablePasteEvent = function (e){
    var clipboardData = e.clipboardData || window.clipboardData || e.originalEvent.clipboardData;
    e.preventDefault();
    var text = clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
}

//---------- Właściwa logika -----------/

class SettingsDialog{
    // --------------------- POTRZEBNE ZMIENNE:

    settings = {}

    // --------------------- BUDOWANIE GUI:

    // Dodaje do menu opcję pola numerycznego.
    _createNumericSetting(key, options){
        // Wartości domyślne.
        _.defaults(options, {
            icon: '',
            title: '',
            detail: '',
            value: false,
            min: 0,
            max: Infinity,
            unit: '',
        });

        if(isNaN(options.value)){
            console.warn("Value isn't a number. Default to min!");
            options.value = min;
        }

        // Budowanie HTML-a.
        const jqSetting = $(`<div class="settings-dialog-setting">`);
        const jqNumericSetting = $(
            `<div class="settings-dialog-numeric-setting">
                <div class="settings-dialog-setting-caption">
                    <div class="settings-dialog-setting-title">${options.icon}${options.title}</div>
                    <div class="settings-dialog-setting-detail">${options.detail}</div>
                </div>
                <div data-unit=" ${options.unit}" data-value="${options.value}"
                    class="settings-dialog-numeric-setting-input" contenteditable>${options.value}</div>
            </div>`
        );
        jqSetting.append(jqNumericSetting);

        const jqInput = jqSetting.find('div[contenteditable]');
        // Usuwanie formatowania przy wklejaniu.
        jqInput.on('paste', contentEditablePasteEvent);
        // Zapobieganie dodawaniu entera.
        jqInput.keypress(function(e){return e.which !== 13;});
        // Dbanie o poprawność wpisywanych danych.
        jqInput.on('input', function(){
            const jqObj = $(this);
            const text  = jqObj.text();
            const value = Number(jqObj.attr('data-value'));

            // Jeśli wartość jest błędna (nie liczba),
            // to zostaje zachowane to co jest w data-value.
            if(isNaN(text)){
                jqObj.text(value);
            }
            else{
                // Sprawdzenie zakresu.
                const val = Number(text);
                const clampValue = Math.max(Math.min(val, options.max), options.min);
                // Zachowanie nowej wartości.
                jqObj.attr('data-value', clampValue);
                // Podmienienie tekstu jeśli był poza granicą liczb.
                if(val !== clampValue)
                    jqObj.text(clampValue);
            }
        });

        // Zapisanie obiektu ustawienia.
        this.settings[key] = {
            type: 'numeric',
            getValue: ()=>{
                return Number(jqInput.attr('data-value')); },
        };

        return jqSetting;
    }
    // Dodaje do menu opcję typu checkbox.
    _createCheckboxSetting(key, options = {}){
        // Wartości domyślne.
        _.defaults(options, {
            title: '',
            icon: '',
            detail: '',
            value: false,
            platforms: null,
        });

        // Sprawdzenie czy ustawienie ma być widoczne, tylko
        // dla wybranych systemów operacyjnych.
        var settingIsVisible = true; var platformIcons = '';
        if(options.platforms !== null){
            // Określenie czy pokazywać ustawienie.
            if(options.platforms.indexOf(os.platform()) == -1){
                settingIsVisible = false;
            }
            // Określenie jakie ikonki dodać przed tytuł.
            const icons = options.platforms.map((platform)=>{
                switch(platform){
                    case 'win32': return webFonts.windows;
                    case 'darwin': return webFonts.macOS;
                    case 'linux': return webFonts.linux;
                    default: return '';
                }
            });
            platformIcons = `<span class="settings-dialog-platforms">${icons.join('')}</span>`;
        }

        // Budowanie HTML-a.
        const jqSetting = $(`<div class="settings-dialog-setting">`);
        const jqCheckboxSetting = $(
            `<label><div class="settings-dialog-checkbox-setting">
                <div class="settings-dialog-setting-caption">
                    <div class="settings-dialog-setting-title">${platformIcons}${options.icon}${options.title}</div>
                    <div class="settings-dialog-setting-detail">${options.detail}</div>
                </div>
                <div class="settings-dialog-checkbox-setting-checkbox">
                    <div class="basic-checkbox"><input type="checkbox" ${options.value ? 'checked' : ''}><span class="checkmark"></span></div>
                </div>
            </div></label>`
        );
        jqSetting.append(jqCheckboxSetting);
        jqSetting.css('display', (settingIsVisible ? 'block' : 'none'));

        const jqCheckbox = jqSetting.find('input[type="checkbox"]');

        // Zapisanie obiektu ustawienia.
        this.settings[key] = {
            type: 'checkbox',
            getValue: ()=>{
                return jqCheckbox.prop('checked'); },
        };

        return jqSetting;
    }
    // Dodanie do GUI poszczególnych opcji.
    _createSettings(options = {}){
        // Dodanie rządanych segmentów.
        for(const key in options){
            const setting = options[key];
            _.defaults(setting, {
                type: 'checkbox',
            })
            var jqSetting;
            switch(setting.type){
                case 'numeric': 
                jqSetting = this._createNumericSetting(key, setting);
                    break;
                case 'checkbox': 
                jqSetting = this._createCheckboxSetting(key, setting);
                    break;
                default: 
                    throw Error(`Setting type: ${setting.type} is unknown!`);
            }
            this.jqSettingsDialogSettingWrapper.append(jqSetting);
        }
    }
    // Główna funkcja budowania całego GUI.
    _createSettingsDialog(options = {}){
        // Główny HTML:
        this.jqSettingsDialog = $(
            `<div class="settings-dialog">
                <div class="settings-dialog-title" style="display: none"></div>
                <div class="settings-dialog-settings-wrapper"></div>
            </div>`
        );
        this.jqSettingsDialogSettingWrapper = this.jqSettingsDialog.find('.settings-dialog-settings-wrapper');
        // Dodanie wszystkich ustawień.
        this._createSettings(options);
    }

    // --------------------- FUNKCJE API:

    // Ustawia tytuł na samej górze.
    setTitle(html = ''){
        const jqTitle = this.jqSettingsDialog.find('.settings-dialog-title');
        jqTitle.html(html);
        if(html.length > 0)
            jqTitle.css('display', 'block');
        else
            jqTitle.css('display', 'none');
    }
    // Zwraca obiekt w którym do kluczy są przypisane wartości ustawień.
    getSettings(){
        const settings = {};
        for(const key in this.settings){
            settings[key] = this.settings[key].getValue();
        }
        return settings;
    }

    // --------------------- INNE:

    constructor(options = {}){
        // Budowanie GUI.
        this._createSettingsDialog(options);
    }

    // Zwraca obiekt jQuery.
    getJQ(){
        return this.jqSettingsDialog;
    }
}

//-------------- Export -------------//

module.exports = SettingsDialog;