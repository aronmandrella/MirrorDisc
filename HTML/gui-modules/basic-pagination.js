"use strict";

//----------- Moduły NodeJs ------------//

const EventEmitter = require('events');
const $            = require('jquery');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const locale = {
    showingRows: 'Wyświetlono wiersze',
    of: 'z',
    next: 'Następna',
    previous: 'Poprzednia',
}
const webFonts = {}

//--------- Załadowanie stylu ----------/

gui.loadStylesheet(__dirname, 'basic-pagination.css');

//---------- Właściwa logika -----------/

class BasicPagination extends EventEmitter{
    // Obsługa eventu klikniecia w paginację.
    _jqEventPaginationClick(){
        var jqObj      = $(this);
        var page       = parseInt(jqObj.attr('data-page'));
        var pagination = jqObj.data('pagination');
        pagination.setPage(page);
    }
    
    // Przygotowuje obiekty jQuery paginacji.
    _createPargination(){
        // HTML:
        this.jqPagination = $(
            `<div class="basic-pagination">
                <div class="basic-pagination-range">
                    ${locale.showingRows}: <span class="pagination-from"></span>
                    — <span class="pagination-to"></span>
                    ${locale.of} <span class="pagination-count"></span>
                </div>
                <div class="basic-pagination-buttons"></div>
            </div>`
            );
    
            // Przygotowanie wszystkich buttonów.
            var jqPaginationButtons = this.jqPagination.find('.basic-pagination-buttons');
            jqPaginationButtons.append($(`<button class="pagination-previous">${locale.previous}</button>`));   
            for(let i = 1; i <= this.options.size; i++) {
                if(i === this.options.size)
                    jqPaginationButtons.append($(`<button class="pagination-dots pagination-dots-after" disabled></button>`)); 
    
                jqPaginationButtons.append($(`<button class="pagination-number pagination-${i}"></button>`)); 
    
                if(i === 1)
                    jqPaginationButtons.append($(`<button class="pagination-dots pagination-dots-before" disabled></button>`)); 
            } 
            jqPaginationButtons.append($(`<button class="pagination-next">${locale.next}</button>`)); 
    
            // Zapisanie buttonów i spanów.
            this.jqButtons = this.jqPagination.find('button');
            this.jqSpans   = this.jqPagination.find('span');

            // Zachowanie referencji na paginację w guzikach.
            this.jqButtons.data('pagination', this);

            // Dodanie obsługi eventów.
            this.jqButtons.on('click', this._jqEventPaginationClick);
    }

    // Wysyła dalej informacje o zmianie paginacji.
    // Dla paginacji bez wirtualnych danych zwróci null jako zakres.
    _sendPaginationChangeEvent(currentPage){
        // Określenie obecnego zakresu wierszy.
        var currentRange = this.ranges[currentPage - 1];
        if(currentRange[0] === null) currentRange = null;
        // Wysłanie obecnego numeru strony i zakresu.
        this.emit('page-changed', currentPage, currentRange);
    }
    // Aktualizuje dane wpisywane do spanów.
    _updateSpans(page){
        var ranges = this.ranges;

        // Określenie liczebności i zakresów.
        var rowCount = ranges[ranges.length - 1][1] + 1;
        var rowsFrom = ranges[page - 1][0] + 1;
        var rowsTo   = ranges[page - 1][1] + 1;

        // Wyjątek dla pustej paginacji.
        if(ranges[ranges.length - 1][1] === null){
            rowCount = '';
            rowsFrom = '';
            rowsTo   = '';
        }

        // Aktualizacja DOM-u.
        this.jqSpans.filter('.pagination-from').text(rowsFrom);
        this.jqSpans.filter('.pagination-to').text(rowsTo);
        this.jqSpans.filter('.pagination-count').text(rowCount);
    }

    // Konstrukcja paginatora.
    constructor(options = {}){
        super();

        // Ustawienia domyślne
        this.options = _.clone(options);
        _.defaults(this.options, {
            size:           5,  
        });

        // Walidacja:
        if(this.options.size < 2)
            throw Error("options.size must be > 2.");

        this._createPargination();
        this.initPagination();
    }

    // Inicializuje paginację. Nalerzy wywołać gdy zmieni się,
    // dla źródła liczba dostępnych wierszy lub gdy zmieniono
    // ile wierszy ma się wyświetlać na jednej stronie.
    initPagination(rowCount = 0, rowsPerPage = 500){
        var ranges = [];

        // Wyznaczenie domkniętych granic rzędów dla każdej strony.
        var rowsInPages = 0;
        while(rowCount > rowsInPages){
            var rangeBeg = rowsInPages;
            var rangeEnd = (rowsInPages += rowsPerPage) - 1;
            ranges.push([rangeBeg, rangeEnd]);
        }

        // Zachowanie faktycznej liczby stron w paginacji.
        this.jqPagination.attr('data-pages', ranges.length);

        // Dodatkowe operacje.
        if(ranges.length !== 0){
            ranges[ranges.length - 1][1] = rowCount - 1;
        }
        else {
            // Domyślna pierwsza strona dla braku elementów.
            ranges.push([null, null]); 
        }
        this.ranges = ranges;

        // Ukrycie nadmiarowych guzików.
        for(let i = 1; i <= this.options.size; i++){
            this.jqButtons.filter('.pagination-' + i).css(
                'display', (i <= ranges.length) ? 'block' : 'none');
        }

        // Reset stanu paginatora.
        this.setPage(1);
    }

    // Ustawia stronę w paginacji. Dla złej wartości rzuci wyjątek.
    setPage(page){
        if(page > this.ranges.length || page <= 0)
            throw Error("page must be <= ranges.length and page must be > 0!");

        // Dla wygody.
        var pgsize = this.options.size;
        var ranges = this.ranges;

        // Zresetowanie wszystkich guzików.
        this.jqButtons.removeClass('active');
        this.jqButtons.filter('.pagination-number').attr('disabled', false);

        // Wartość 'page' na samym początku zakresu.
        if((page <= Math.floor(pgsize / 2 + 1)) || ranges.length < pgsize){
            // Ukrycie kropek na początku i pokazanie lub ukrycie kropek na końcu.
            this.jqButtons.filter('.pagination-dots-before').attr('data-show-dots', false);
            this.jqButtons.filter('.pagination-dots-after').attr('data-show-dots', ranges.length > pgsize);

            // Wpisanie pczątkowych wartości numeracji i zaznaczenie strony.
            let p = 1;
            for(let i = 1; i <= pgsize - 1; i++, p++) {
                var jqButton = this.jqButtons.filter('.pagination-' + i);
                jqButton.attr('data-page', p);
                if(p === page) {
                    jqButton.addClass("active", true);
                    jqButton.attr('disabled', true);
                }
            }
            
            // Ustawienie numeru ostatniej strony.
            this.jqButtons.filter('.pagination-' + pgsize).attr('data-page', ranges.length);
        }
        // Wartość 'page' na samym końcu zakresu.
        else if(page >= Math.ceil(ranges.length - pgsize / 2)){
            // Ukrycie kropek na końcu i pokazanie lub ukrycie kropek na początku.
            this.jqButtons.filter('.pagination-dots-before').attr('data-show-dots', ranges.length > pgsize);
            this.jqButtons.filter('.pagination-dots-after').attr('data-show-dots', false);

            // Wpisanie końcowych wartości numeracji i zaznaczenie strony.
            let p = this.ranges.length - (pgsize - 1) + 1;
            for(let i = 2; i <= pgsize; i++, p++){
                var jqButton = this.jqButtons.filter('.pagination-' + i);
                jqButton.attr('data-page', p);
                if(p === page) {
                    jqButton.addClass("active", true);
                    jqButton.attr('disabled', true);
                }
            }

            // Ustawienie numeru pierwszej strony.
            this.jqButtons.filter('.pagination-1').attr('data-page', 1);
        }
        // Wartość 'page' w środku zakresu.
        else {
            // Pokazanie kropek.
            this.jqButtons.filter('.pagination-dots-after').attr('data-show-dots', true);
            this.jqButtons.filter('.pagination-dots-before').attr('data-show-dots', true);

            // Wpisanie środkowych wartości numeracji i zaznaczenie strony.
            let p = Math.ceil(page - (pgsize - 2)/2);
            for(let i = 2; i <= pgsize - 1; i++, p++){
                var jqButton = this.jqButtons.filter('.pagination-' + i);
                jqButton.attr('data-page', p);
                if(p === page) {
                    jqButton.addClass("active", true);
                    jqButton.attr('disabled', true);
                }
            }

            // Ustawienie numeru pierwszej i ostatniej strony.
            this.jqButtons.filter('.pagination-1').attr('data-page', 1);
            this.jqButtons.filter('.pagination-' + pgsize).attr('data-page', ranges.length);
        }

        // Blokowanie guzików kolejny i poprzedni i ustawienie ich wartości.
        var jqPrevious = this.jqButtons.filter('.pagination-previous');
        jqPrevious.attr('disabled', !(page > 1));
        jqPrevious.attr('data-page', page - 1);
        var jqNext = this.jqButtons.filter('.pagination-next');
        jqNext.attr('disabled', !(page < ranges.length));
        jqNext.attr('data-page', page + 1);

        // Aktualizuje dane wpisywane do spanów.
        this.currentPage = page;
        this._updateSpans(page);
        this._sendPaginationChangeEvent(page);
    }

    // Zwraca obiekt jQuery.
    getJQ(){
        return this.jqPagination;
    }
}

//-------------- Export -------------//

module.exports = BasicPagination;