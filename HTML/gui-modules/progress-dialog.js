
"use strict";

//----------- Moduły NodeJs ------------//

// Moduły NodeJs:
const _ = require('lodash');
const $ = require('jquery');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

var webFonts = {};
var locale = {
    'cancel': 'Przerwij',
    'finish': 'Zakończ',
    'details': 'szczegóły',
}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'progress-dialog.css');

//---------- Właściwa logika -----------/

// Utilty do łączenia stringów.
function join(array, sep = ' '){
    if(!Array.isArray(array)) array = [array];
    return _.join(array, sep);
}

/* Klasa wrapperu tekstu z kolorkami */
class Message{
    // Konstrukcja.
    constructor(){
        this.jqMessage = $(
            `<div class="progress-dialog-message"></div>`
        );
    }

    // Ustawia wartość po prawej.
    set text(html){
        this.jqMessage.html(join(html, ' '));
    }
    // Ustawia data-color
    set color(c){
        this.jqMessage.attr('data-color', c);
    }
    set details(data){
        var jqDetails = $(`<span class="progress-dialog-message-details">(${locale.details})</span>`);
        this.jqMessage.append(jqDetails);

        jqDetails.click(function(){
            if(data instanceof String){
                data = {detail: data};
            }
            _.defaults(data, {
                title: '',
                message: '',
                detail: '',
            })

            const remote = require('electron').remote;
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                type: "warning",
                title: ' ' + data.title,
                message: data.message,
                detail: data.detail
            });;
        });
    }

    // Zwraca obiek jQuery.
    getJQ(){
        return this.jqMessage;
    }
}
/* Klasa elementu typu: Znaleziono plików 290 */
class ProgressField{
    // Konstrukcja.
    constructor(){
        this.jqProgressField = $(
            `<div class="progress-dialog-progress-field">
                <span class="progress-dialog-progress-field-title"></span>
                <span class="progress-dialog-progress-field-value"></span>
            </div>`
        );
        this.jqTitle = this.jqProgressField.find('.progress-dialog-progress-field-title');
        this.jqValue = this.jqProgressField.find('.progress-dialog-progress-field-value');
    }

    // Ustawia wartość po prawej.
    set value(html){
        html = _.defaultTo(html, '');
        this.jqValue.html(html);
    }
    // Ustawia tytuł po lewej.
    set title(html){
        this.jqTitle.html(html);
    }
    // Ustawia data-color
    set color(c){
        this.jqProgressField.attr('data-color', c);
    }

    // Zwraca obiek jQuery.
    getJQ(){
        return this.jqProgressField;
    }
}
/* Klasa prostego paskowego progress bara */
class ProgressBar{
    // Konstrukcja.
    constructor(){
        this.jqProgressBar = $(
            `<div class="progress-dialog-progressbar">
                <div class="progress-dialog-progressbar-inner"></div>
            </div>`
        );
        this.jqProgressBarInner = this.jqProgressBar.find('.progress-dialog-progressbar-inner');
    }

    // Ustawia stan wypełnienia.
    set value(v){
        v = parseFloat(v);
        v = _.defaultTo(v, 0);
        this.jqProgressBarInner.css('width', v*100 + '%');
    }

    // Zwraca obiek jQuery.
    getJQ(){
        return this.jqProgressBar;
    }
}

/* Główna klasa aplikacji */
class ProgressDialog{
    // --------------------- POTRZEBNE ZMIENNE:

    segments     = {}

    isClosing    = false
    isFinished   = false

    summary      = null
    progressBar  = null
    fields       = null

    updateTimeMs = 250

    win = require('electron').remote.getCurrentWindow()

    // --------------------- LOKALNE EVENTY:

    // Wywoływana przy kliknięciu jednego z guzików.
    _onButton(buttonType){
        if(this.isClosing === false){
            this.isClosing = true;
            switch(buttonType){
                case 'finish': return this.onFinish();
                case 'cancel': return this.onCancel();
                case 'close': {
                    if(this.isFinished === true)
                        return this.onFinish();
                    else
                        return this.onCancel();
                }
            }
        }
    }
    // Wywoływane przy kliknięciu w 'Zakończ'.
    onFinish(){
        alert('Warning: Default onFinish()!');
        this.closeWindow();
    }
    // Wywoływane przy kliknięciu w 'Anuluj'.
    onCancel(){
        alert('Warning: Default onCancel()!');
        this.closeWindow();
    }

    // Funkcja wywoływana periodycznie by aktualizować GUI.
    _requestUpdate(){
        this.onUpdate();
        if(this.isFinished !== true)
            setTimeout(()=>this._requestUpdate(), this.updateTimeMs);
    }
    // Wywoływana przy rządaniu oświerzenia GUI.
    onUpdate(){
        console.warn('Warning: Default onupdate()!');
    }

    // Inicializacja i uruchomienie skryptów.
    initialize(){
        console.warn('Warning: Default initialize()!'); 
    }

    // Symuluje zachowanie guzika zamknij.
    close(){
        this._onButton('close');
    }

    // --------------------- BUDOWANIE GUI:

    // Tworzy segment z polami w które można wpisywać informacje.
    _createProgressFieldSegment(key, header = '', fieldsData = {}){
        var jqProgressfieldSegment = $('<div class="progress-dialog-segment">');
        jqProgressfieldSegment.append(`<div class="progress-dialog-segment-header">${join(header, ' ')}</div>`);

        const fields = {};

        for(const _key in fieldsData){
            const fieldData = fieldsData[_key];
            
            const field = new ProgressField();
            field.title = _.defaultTo(fieldData.title, '');
            field.value = _.defaultTo(fieldData.value, '');
            field.color = _.defaultTo(fieldData.color, 'default');
            jqProgressfieldSegment.append(field.getJQ());
            fields[_key] = field;
        }

        this.segments[key] = fields;

        return jqProgressfieldSegment;
    }
    // Tworzy segment z progress barem.
    _createProgressBarSegment(key, header){
        var jqProgressbarSegment = $('<div class="progress-dialog-segment">');
        jqProgressbarSegment.append(`<div class="progress-dialog-segment-header">${join(header, ' ')}</div>`);

        const progressBar = new ProgressBar();
        jqProgressbarSegment.append(progressBar.getJQ());

        this.segments[key] = progressBar;

        return jqProgressbarSegment;
    }
    // Tworzy segment podsumowania.
    _createMessageSegment(key, header, text = '', color = 'transparent'){
        var jqMessageSegment = $('<div class="progress-dialog-segment">');
        jqMessageSegment.append(`<div class="progress-dialog-segment-header">${join(header, ' ')}</div>`);

        const message = new Message();
        message.text  = text;
        message.color = color;
        jqMessageSegment.append(message.getJQ());

        this.segments[key] = message;

        return jqMessageSegment;
    }
    // Tworzy segment z guzikami.
    _createButtonSegment(){
        // HTML:
        var jqButtonSegment = $(
            `<div class="progress-dialog-segment progress-dialog-button-segment"><div class="progress-dialog-buttons">
                <button data-type="finish" class="finish-button matter-button-contained" disabled>${locale.finish}</button>
                <button data-type="cancel" class="cancel-button matter-button-outlined">${locale.cancel}</button>
            </div></div>`
        );
        // Podpiecie eventów.
        var obj = this;
        var jqButtons = jqButtonSegment.find('button');
        jqButtons.on('click', function(){
            // Blokada guzików przed ponownym wciskaniem.
            jqButtons.prop('disabled', true); 
            // Wywołanie eventu.
            obj._onButton($(this).attr('data-type'));
        });

        return jqButtonSegment;
    }
    // Główna funkcja budowania zmiennej części GUI.
    _createSegments(options = {}){
        // Dodanie rządanych segmentów.
        for(const key in options){
            let segment = options[key];
            var jqSegment;
            switch(segment.type){
                case 'fields': 
                    var jqSegment = this._createProgressFieldSegment(
                        key, segment.header, segment.fields);
                    break;
                case 'progress':
                    var jqSegment = this._createProgressBarSegment(
                        key, segment.header);
                    break;
                case 'message':
                    var jqSegment = this._createMessageSegment(
                        key, segment.header, segment.text);
                    break;
                default:
                    throw Error(`Segent type: ${segment.type} is unknown!`);
            }
            this.jqProgressDialog.find('.progress-dialog-wrapper').append(jqSegment);
        }
    }
    // Główna funkcja budowania całego GUI.
    _createProgressDialog(options = {}){
        // Główny HTML:
        this.jqProgressDialog = $(
            `<div class="progress-dialog">
                <div class="progress-dialog-title"><span class="progress-dialog-title-inner"></span></div>
                <div class="progress-dialog-wrapper"></div>
            </div>`
        );

        // Dodanie części segmentowej.
        this._createSegments(options);

        // Dodanie guzików zakończ i anuluj.
        var jqButtonSegment = this._createButtonSegment();
        this.jqProgressDialog.append(jqButtonSegment);
    }

    // --------------------- FUNKCJE API:

    // Ustawia tytuł na samej górze i można określić czy ma migać.
    setTitle(html, blinking = true){
        var innerTitle = this.jqProgressDialog.find('.progress-dialog-title-inner');
        innerTitle.html(html);
        if(blinking)
            innerTitle.addClass('progress-dialog-blinking');
        else
            innerTitle.removeClass('progress-dialog-blinking');
    }
    // Ustawia okienko w tryb wykonanego zadania.
    setAsFinished(){
        // Zablokowanie cancel, odblokowanie finish.
        this.jqProgressDialog.find('.finish-button').prop('disabled', false);
        this.jqProgressDialog.find('.cancel-button').prop('disabled', true);

        // Przeniesie okienka na front.
        this.win.show();
        this.win.flashFrame();

        // Zaktualizowanie wewnętrznego stanu.
        this.isFinished = true;
    }
    // Rozpoczytna periodyczną aktualizację GUI.
    startUpdates(){
        this._requestUpdate();
    }
    // Ustawia postęp na pasku stanu.
    setWindowProgress(value){
        this.win.setProgressBar(value);
    }

    // --------------------- INNE:

    constructor(options){
        // Budowanie GUI.
        this._createProgressDialog(options);
    }

    // Zwraca obiekt jQuery.
    getJQ(){
        return this.jqProgressDialog;
    }
}

//-------------- Export -------------//

module.exports = ProgressDialog;