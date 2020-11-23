"use strict";

//----------- Moduły NodeJs ------------//

const $    = require('jquery');
const Swal = require('sweetalert2')

//------------- Moduły gui -------------//

const gui           = require('./_gui-module');
const BasicTitlebar = require('./basic-titlebar');

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'basic-modal.css');

//---------- Właściwa logika -----------//

// Dodawanie animacji z animate.css
const animateCSS = (selector, animationName)=>{
    return new Promise((resolve, reject)=>{
        const jqObj   = $(selector).not('.acss');
        const classes = "acss animated " + animationName;

        if(jqObj.length === 0) return reject();
    
        jqObj.addClass(classes);
        jqObj.on('animationend.acss', function(){
            jqObj.removeClass(classes);
            jqObj.off('.acss');
     
            return resolve();
        });
    });
}

// Klasa okienka.
class BasicModal{
    win = require('electron').remote.getCurrentWindow()

    // --------------- KONSTRUKCJA GUI:

    // Tworzy title bar u góry:
    _createTitlebar(options = {}){
        _.defaults(options,{
            icon: '',
            info: '',
            title: '',
        });
        this.titlebar = new BasicTitlebar();
        this.titlebar.setTitlebarIcon(options.icon);
        this.titlebar.setTitlebarInfo(options.info);
        this.titlebar.setTitlebarTitle(options.title);
        this.titlebar.onClose = ()=>this.onCloseButton();
        return this.titlebar.getJQ();
    }

    constructor(options = {}){
        this.options = _.defaults(options, {
            width: 500,
            jqContent: null,
        });
    }

    //---------------- FUNKCJE API:

    setTitle(html){
		this.titlebar.setTitlebarTitle(html);
    }
    setInfo(html){
		this.titlebar.setTitlebarInfo(html);
    }
    setIcon(html){
		this.titlebar.setTitlebarIcon(html);
    }

    // Kliknięcie guzika zamknij na titlebarze.
    onCloseButton(){}
    // Kliknięcie w zaciemnione tło.
    onBackgroundClick(jqContainer){}

    // Wywołuje dla modala animację.
    attentionSeeker(openAnimation = false){
        if(openAnimation) return;
        
        animateCSS('.swal2-modal', 'shake')
            .catch(()=>{ }) // Nie można dodać (inna animacja trwa)
            .then(()=>{ }) // Animacja się zakończyła.
    }

    // Eventy typowe dla SweetAlert2. Pierwszy argument
    // to wewnętrzny obiekt opakowany w jQuery.
    onBeforeOpen(jqContent){}
    onOpen(jqContent){}
    onClose(jqContent){}
    onAfterClose(jqContent){}

    // Otwarcie modala i blokada zamykania okna.
    open(){
        // Zablokowanie możliwości zamkniecia okienka,
        // i zapisanie starego handlera zamykania.
        this.unloadHandler = window.onbeforeunload;
        window.onbeforeunload = (e)=>{e.returnValue = false;};
       
        // Pobranie głównego contentu SweetAlert2.
        const swalContent = ()=>{
            return $(document.getElementById("swal2-content"))};
        // Pobranie zaciemnionego tła.
        const swalContainer = ()=>{
            return $(".swal2-container")};

        var obj = this;

        // Pokazanie SweetAlert2.
        Swal.fire({
            width: this.options.width + 'px',
            html: ' ', // <-- Cokolwiek by się wyświetlił...
            padding: 0,
            animation: false,

            // Dodatkowe klasy stylu:
            customClass: {
                container: 'basic-modal-container',
                popup: 'basic-modal-popup',
                content: 'basic-modal-content',
              },

            // Eventy:
            onBeforeOpen:   ()=>{
                var jqContent = swalContent();
                // Dodanie titlebara.
                jqContent.append(this._createTitlebar(this.options));
                // Dodanie zdefiniowanego kontentu.
                if(this.options.jqContent !== null)
                    jqContent.append(this.options.jqContent);
                // Reagowanie na kliknięcie w zaciemnione tło.
                swalContainer().on('click', function(e){
                    // By wykryć kliknięcie w tło, kliknięcie
                    // musi być bezpośrednie a nie przez dziecko.
                    if($(e.target).is(swalContainer())){
                        // Wywołanie animacji.
                        obj.attentionSeeker();
                        // Event.
                        obj.onBackgroundClick(swalContainer());
                    }
                });
                // Wywołanie animacji.
                this.attentionSeeker(true);
                // Event.
                this.onBeforeOpen(jqContent);
            },
            onOpen:         ()=>this.onOpen(swalContent()),
            onClose:        ()=>this.onClose(swalContent()),
            onAfterClose:   ()=>{
                // Przywrócenie handlera zamykania okienka.
                window.onbeforeunload = this.unloadHandler;
                // Na wypadek jeśli modal to ustawiał.
                this.win.setProgressBar(0);
                this.onAfterClose();
            },

            // Pozostałe ustawienia.
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            showCancelButton: false,
          })
    }
    // Zamkniecie modala i zwolnienie blokady zamykania.
    close(){
        Swal.close(); 
        this.titlebar.clearEventHandlers();
    }
}

//-------------- Export -------------//

module.exports = BasicModal;