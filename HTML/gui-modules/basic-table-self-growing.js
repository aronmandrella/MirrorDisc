
"use strict";

//----------- Moduły NodeJs ------------//

// Moduły NodeJs:
const _       = require('lodash');
const $       = require('jquery');

//------------- Moduły gui -------------//

const gui = require('./_gui-module');

//---------- Tekst i webfony -----------/

const webFonts = {};
const locale = {};

//--------- Załadowanie stylu ----------/


//---------- Właściwa logika -----------/

/* Główna klasa aplikacji */
class BasicTableSelfGrowing{

    //------------------- WALIDACJA ŚCIERZEK ITP:

    // Podmienia symbole specialne (np %app-dir) i normalizuje ścieżkę.
    _parsePath(p){
        // Symbol dysku na którym uruchomiono aplikację:
        p = p.replace(new RegExp('%current-drive', 'gi'), runningDisc);
        // Symbol folderu aplikacji:
        p = p.replace(new RegExp('%app-dir', 'gi'), exeDir);
        
        return path.normalize(p);
    }
    // Sprawdza czy podana ścieżka istnieje, jest absolutna i jest folderem.
    _dirPathIsVailid(p){

        if(p.length === 0) return false;
        try {
            if(!path.isAbsolute(p)) throw Error("Path isn't absolute.");
            if(!fs.statSync(p).isDirectory()) throw Error("Path isn't a folder.");
        }
        catch(err) { return false; }
        return true;
    }
    // Sprawdza czy ścieżki wskazują na ten sam folder.
    // ( Uwzględnia to że na Windows case nie ma znaczenia. )
    _arePathsEqual(p1, p2){
        return path.relative(p1, p2).length === 0;
    }
    // Sprawdza czy podana ścieżka 'dir' jest ścieżką znajdujacą się wewnątrz 'parent'.
    // Jeśli określają ten sam folder to zostanie zwróconce false.
    _isChildPathOf = (dir, parent) => {
        // if(!path.isAbsolute(dir) || !path.isAbsolute(parent))
        //     throw Error('Both paths need to be absolute.');
        const relative = path.relative(parent, dir);
        if(relative.length === 0) return false;
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }


    //------------------- OBSŁUGA EVENTÓW:

    // Usuwa formatowanie tekstu wklejanego do div contenteditable.
    _jqEventRemoveContenteditableFormatingOnPaste(e){
        var clipboardData = e.clipboardData || window.clipboardData || e.originalEvent.clipboardData;
        e.preventDefault();
        var text = clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
    }
    // Na bierząco waliduje wpisywane dane i ustawia
    // odpowiednie klasy błędów dla stylizowania CSS.
    _jqEventPathInputValidation(){
        var jqPath = $(this);
        var jqRow  = jqPath.closest('.flink-table-row');
        var row    = jqRow.data('obj');

        // Walidacja całego wiersza:
        row.table._validateRowOfPaths(row);

        // Poinformowanie u zmianie ustawień.
        appEventEmitter.emit('user-input');

        // Dalsza aktualizacja tabeli.
        return row.table._autoManageRows();
    }
    // Wywowołuje dialog wyboru folderu i aktualizuje,
    // pole wpisywania ścierzki jeśli wybrano folder.
    _jqEventOpenDialog(){
        const jqPath = $(this);
        const jqRow  = jqPath.closest('.flink-table-row');
        const row    = jqRow.data('obj');
        const key    = jqPath.attr('data-type');

        // Otwarcie obecnie wpisanej ścieżki lub pulpitu jeśli ścieżka jest błędna.
        const currentPath = (!row[key].error) ? row[key].path : app.getPath('desktop');

        // Wywołanie dialogu i czekanie na odpowiedź.
        var choosedPath = dialog.showOpenDialog(win, { 
            defaultPath: currentPath,
            properties: ['openDirectory']
        });

        if(choosedPath !== undefined) {
            jqPath.text(choosedPath);
            // Dalsza część aktualizacji...
            jqPath.trigger('input'); 
        }
    }
    // Obsługa checkboxa.
    _jqEventCheckbox(){
        var jqCheckBox = $(this);
        var jqRow = jqCheckBox.closest('.flink-table-row');
        var isChecked = jqCheckBox[0].checked;
        var rowInfo = jqRow.data('obj');
        rowInfo.isChecked = isChecked;

        // Poinformowanie u zmianie ustawień.
        appEventEmitter.emit('user-input');
    }
    // Realizacja sortowania elementu.
    _jqEventSort(){
        var jqArrow = $(this);
        if(jqArrow.hasClass('disabled')) return;

        var jqRowA  = jqArrow.closest('.flink-table-row');
        var rowA    = jqRowA.data('obj');
        var rows    = rowA.table.rows;
        var sort    = (jqArrow.data('sort') === 'up') ? -1 : 1;
     
        // Określenie indeksu wiersza.
        var iA = rows.indexOf(rowA);
        if(iA === -1)
            throw Error("this.rows don't contains rowA.");

        // Znalezienie wiersza do podmiany.
        var iB = iA + sort;
        var rowB = rows[iB];
        if(rowB === undefined || rows[iB + 1] === undefined)
            throw Error("Couldn't sort in this direction.");
        var jqRowB = rowB.jqRow;
        
        // Podmiana obiektów jQuery.
        if(sort === 1)
            jqRowA.before(jqRowB);
        else
            jqRowA.after(jqRowB);

        // Podmiana w tablicy rzędów.
        [rows[iA], rows[iB]] = [rows[iB], rows[iA]];

        // Aktualizacja rzędów.
        rowA.table._autoManageRows();
    }

    // Obsługa usuwania w menu kontekstowym
    _ctxMenuRemove(jqRow){
        // Dla kliknięcia z punktu widzenia ścieżki.
        if(!jqRow.hasClass('basic-table-row')){
            jqRow = jqRow.closest('.basic-table-row');
        }
        var row = jqRow.data('obj');
        
        // Wiersz już usunięto (prowizoryczne rozwiązanie by nie było wyjątku)
        if(this.rows.indexOf(row) === -1) return;

        this._removeRow(row);
        this._autoManageRows();
    }
    // Blokowanie guzików w menu konteksotwym.
    _ctxMenuPathValidator(jqPath){
        const jqRow  = jqPath.closest('.flink-table-row');
        const row    = jqRow.data('obj');
        const key    = jqPath.attr('data-type');

        // Wiersz już usunięto (prowizoryczne rozwiązanie by nie było wyjątku)
        if(row === undefined) return false;

        return row[key].error === false;
    }
    // Blokowanie guzików w menu konteksotwym.
    _ctxMenuRowValidator(jqRow){
        // Dla kliknięcia z punktu widzenia ścieżki.
        if(!jqRow.hasClass('basic-table-row')){
            jqRow = jqRow.closest('.basic-table-row');
        }
        var row = jqRow.data('obj');

        // Wiersz musi nadal istnieć.
        if(row === undefined || (this.rows.indexOf(row) === -1))
            return false;
        // Wiersz nie może być pusty.
        if(row.isEmpty === true)
            return false;
        
        return true;
    }
    // Pokazuje wybrany folder.
    _ctxMenuShowFolder(jqPath){
        const jqRow  = jqPath.closest('.flink-table-row');
        const row    = jqRow.data('obj');
        const key    = jqPath.attr('data-type');

        // Pokazanie zawartości.
        shell.openItem(row[key].path);
    }
    // Wyświetla w tabeli zawartośc folderu.
    _ctxMenuShowContents(jqPath){
        const jqRow  = jqPath.closest('.flink-table-row');
        const row    = jqRow.data('obj');
        const key    = jqPath.attr('data-type');

        const path   = row[key].path;

        // Wysłanie informacji dalej...
        appEventEmitter.emit('show-contents', path);
    }
        

    //------------------- GŁÓWNE FUNKCIONALNOŚCI:

    // Przeprowadza walidację poprawności ścieżek w podanym wierszu.
    _validateRowOfPaths(row){
        // Typy ścierzek w wierszu (zapisane w obiekcie).
        const keys = ["source", "target"];

        keys.forEach((key)=>{
            // Pobranie surowego tekstu z wierszy:
            row[key].text = row[key].jqPath.text();
            // Konwersja tekstu na ścieżki:
            row[key].path = this._parsePath(row[key].text);
            // Sprawdzenie czy ścieżka folderu jest poprawna.
            row[key].error = !this._dirPathIsVailid(row[key].path);
        });

        // Lista wszystkich ścieżek.
        const paths = keys.map((key)=>{ return row[key].path; });
        // Lista z informacją o błędzie każdej ścieżki.
        const errors = keys.map((key)=>{ return row[key].error; });
        // Lista unikalnych ścieżek (dlatego tak, bo windows np nie rozróżnia case-a.)
        const uniqPaths = _.uniqWith(paths, (p1, p2)=>{ return this._arePathsEqual(p1, p2);});
        // Lista długości surowego tekstu z GUI.
        const textLengths = keys.map((key)=>{ return row[key].text.length; });

        // Sprawdzenie czy w rzędzie są niepoprawne ścieżki.
        row.hasError = errors.filter((a)=>{ return a === true }).length > 0;
        // Sprawdzenie czy są powielenia ścieżek.
        row.hasEqual = uniqPaths.length !== paths.length;
        // Sprawdzenie czy rząd jest jeszcze pusty.
        row.isEmpty  = textLengths.filter((a)=>{ return a > 0 }).length === 0;
        // Sprawdzenie czy wszystkie komórki są zapełnione.
        row.isFilled = textLengths.filter((a)=>{ return a > 0 }).length === textLengths.length;
        // Sprawdze czy wiersz jest w pełni poprawny.
        row.isGood   = row.isFilled && !row.isEmpty && !row.hasError && !row.hasEqual;

        // Przypisanie stylów dla komórek.
        keys.forEach((key)=>{
            // Tekst na czerwono jeśli ścieżki nie są różne lub jeśli jest błąd.
            if((row[key].error || row.hasEqual) && row[key].text.length)
                row[key].jqPath.attr('data-color', 'danger');
            else
                row[key].jqPath.attr('data-color', 'default');
  
            // Odpowiednia informacja w title po najechaniu myszką.
            if(row[key].text.length === 0)
                row[key].jqPath.attr('title', variousText.chooseFolder);
            else if (row[key].error)
                row[key].jqPath.attr('title', variousText.enteredWrongPath);
            else if (row.hasEqual)
                row[key].jqPath.attr('title', variousText.pathsAreTheSame);
            else
                row[key].jqPath.attr('title', row[key].path);
        });

        // Przypisanie atrybutów do rzędu.
        const jqRow = row.jqRow;
        if(row.isEmpty)
            jqRow.attr('data-label', 'default');
        else if(row.isGood)
            jqRow.attr('data-label', 'safe');
        else
            jqRow.attr('data-label', 'danger');
    }
    // Automatycznie zarządza wierszami tak by nie było,
    // w środku pustych wierszy, i by na końcu zawsze był
    // pusty wiersz (usuwa i dodaje wiersze w locie).
    _autoManageRows(){
        // WAŻNE: Tworzenie z opóźnieniem (granacja by w trakcie usuwania,
        // nic nie ingerowało w tablicę - appendRow wywołuje pośrednio _autoManageRows)
        var requestEmptyRowAppend = false;
        
        // Zarządzanie istnieniem wierszy.
        var rowsToRemove = [];
        this.rows.forEach((row, i, rows)=>{ 
            if(i < rows.length - 1) {
                // Początkowe puste wiersze można usunąć...
                if(row.isEmpty === true) rowsToRemove.push(row);   
            }
            else {
                // Na samym koncu musi być zawsze pusty wiersz..
                if(row.isEmpty === false) requestEmptyRowAppend = true;   
            }
        }, this);

        rowsToRemove.forEach((row)=>{
            this._removeRow(row);
        },this);

        // Określenie w jakich kierunkach można sortować.
        this.rows.forEach((row, i, rows)=>{ 
            var upSort = (i > 0) && !row.isEmpty;
            var downSort = (i < rows.length -2) && !row.isEmpty;

            var jqSortUp   = row.jqRow.find('.basic-table-sort-button[data-sort="up"]');
            var jqSortDown = row.jqRow.find('.basic-table-sort-button[data-sort="down"]');

            if(upSort) jqSortUp.removeClass('disabled')
            else jqSortUp.addClass('disabled');

            if(downSort) jqSortDown.removeClass('disabled')
            else jqSortDown.addClass('disabled');
        }, this);

        // Ewentualne dodanie pustego wiersza na końcu.
        if(this.rows.length === 0 || requestEmptyRowAppend) {
            this.appendRow();
            return;
        }
    }
    // Usuwa wskazany wiersz.
    _removeRow(row){
        // Poinformowanie u zmianie ustawień.
        appEventEmitter.emit('user-input');

        if(!this.rows.remove(row))
            throw Error('row not found in this.rows!');
        row.jqRow.remove();
    }
    // Sprawdza sęsowność połączeń między folderami.
    _validateLinkLogic(folderLinks = {}){
        // Przygotowanie tablic źródeł i celów.
        var sources = folderLinks.map((obj)=>{ return obj.source; });
        var targets = folderLinks.map((obj)=>{ return obj.target; });
        
        // Zwraca numery wierszy (numeracja od 1), w których podana ścieżka,
        // jest synchronizowana bezpośrednio lub pośrednio (częściowo przez
        // jakieś dziecko lub całościowo przez jakiegoś rodzica).
        const getRowsDoingDirectOrIndirectSync = (path)=>{
            return _.compact(targets.map((target, j)=>{
                const rowIndex = j + 1;
                // 'path' jest identyczny jak ścieżka synchronizowana.
                if(this._arePathsEqual(path, target))
                    return rowIndex;
                // Jakiś rodzic 'path' jest synchronizowany.
                else if(this._isChildPathOf(path, target))
                    return rowIndex;
                // Jakieś dziecko 'path' jest synchronizowane.
                else if(this._isChildPathOf(target, path))
                    return rowIndex;
                else
                    return null;

            }));
        };
        // Sprawdzenie wielokrotnej synchronizacji ścieżek docelowych.
        const multipleSyncTargets = [];
        targets.forEach((target, i)=>{
            // Poszukiwanie przypadków wielokrotnej synchronizacji danej ścieżki.
            const forbiddenTargets = getRowsDoingDirectOrIndirectSync(target);
            // Ścieżka jest synchronizowana (pośrednio lub nie) w więcej niż 
            // tylko w jednym wierszu. Błąd bo to prowadzi do niejednoznaczności.
            if(forbiddenTargets.length > 1){
                multipleSyncTargets.push(
                    `• ${variousText.folder} "${target}" ${
                        variousText.fromRow} ${i + 1} ${
                            variousText.inRows} [${forbiddenTargets.join(', ')}]`
                );
            }
        });
        // Sprawdzenie niezależności ścieżek źródłowych.
        const nonIndependentSources = [];
        sources.forEach((source, i)=>{
            // Poszukiwanie przypadków synchronizacji ścieżki źródłowej.
            const forbiddenSources = getRowsDoingDirectOrIndirectSync(source);
            // Ścieżka żródłowa jest synchronizowana (pośrednio lub nie).
            // Błąd bo to prowadzi do niejednoznaczności.
            if(forbiddenSources.length > 0){
                nonIndependentSources.push(
                    `• ${variousText.folder} "${source}" ${
                        variousText.fromRow} ${i + 1} ${
                            variousText.inRows} [${forbiddenSources.join(', ')}]`
                );
            }
        });
        
        // Określenie czy logika połączeń jest poprawna.
        if(multipleSyncTargets.length === 0 && nonIndependentSources.length === 0)
            return true;
        else{
            // Wyświetlenie informacji o błędach logicznych połączeń
            var infos = [];
            if(multipleSyncTargets.length !== 0 )
                infos.push(`${variousText.multipleSyncTargets}\n\n${multipleSyncTargets.join(',\n')}`);
            if(nonIndependentSources.length !== 0 )
                infos.push(`${variousText.nonIndependentSources}\n\n${nonIndependentSources.join(',\n')}`);

            dialog.showMessageBox(win, {
                type: "warning",
                title: ' ' + variousText.errorInFolderLinkTable,
                message: variousText.folderLinksLogicErrors,
                detail: infos.join('\n\n'),
            });

            return false;
        }
    }

    //------------------- BUDOWANIE GUI:

    // Buduje główną część tabeli.
    _createFolderLinkTable(options = {}){
        // Domyślne parametry jeśli nie podano.
        _.defaults(options, {
            describeSymLinks:   false,
        })

        // Ustawienia związane z trybem:
        this.describeSymLinks = options.describeSymLinks;
        var targetIcon = this.describeSymLinks
            ? webFonts.link : webFonts.download;

        // HTML:
        this.jqTableWrapper = $('<div class="flink-table basic-table">');
        this.jqLinkTable = $(
            `<table>
                <tr class="basic-table-header">
                    <th class="basic-table-col-basic-checkbox"></th>
                    <th class="basic-table-col-id">${variousText.id}</th>
                    <th>${webFonts.folderOpen} ${variousText.sourceFolder}</th>
                    <th>${targetIcon} ${variousText.targetFolder}</th>
                    <th class="basic-table-col-sort"></th>
                </tr>
            </table>`
        );
        this.jqTableWrapper.append(this.jqLinkTable);
    }
    // Dodaje rząd na koniec tabeli.
    appendRow(data = {}){
        // Domyślne parametry jeśli nie podano.
        _.defaults(data,{
            source:     '',
            target:     '',
            isChecked:  true
        })

        // Obiekt rzędu:
        var row = {
            table: this,
            isChecked: data.isChecked,
            source: {}, target: {},
        };


        const columns = [{
                name: 'source',

            },{
                name: 'target',
    
            }
        ];


        // HTML:
        row.jqRow = $(
            `<tr class="basic-table-row flink-table-row">
                <td class="basic-table-col-basic-checkbox"><label class="basic-checkbox" title="${variousText.synchronizeThisFolders}">
                    <input class="flink-checkbox-input" type="checkbox" ${data.isChecked ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label></td>
                <td class="basic-table-col-id"></td>
                <td class="flink-table-path" data-type="source" title="${variousText.chooseFolder}"
                    data-placeholder="${variousText.clickTwiceChooseSourceFolder}" contenteditable>${data.source}</td>
                <td class="flink-table-path" data-type="target" title="${variousText.chooseFolder}"
                    data-placeholder="${variousText.clickTwiceChooseTargetFolder}" contenteditable>${data.target}</td>
                <td class="basic-table-col-sort"><div class="basic-table-sort">
                    <div class="basic-table-sort-button disabled" data-sort="up">${webFonts.angleUp}</div>
                    <div class="basic-table-sort-button disabled" data-sort="down">${webFonts.angleDown}</div>
                </div></td>
            </tr>`
        );

        // Zachowanie this w wierszu.
        row.jqRow.data('obj', row);

        // Zachowanie obiektów jQuery pól na ścieżki.
        row.source.jqPath = row.jqRow.find('.flink-table-path[data-type="source"]');
        row.target.jqPath = row.jqRow.find('.flink-table-path[data-type="target"]');

        // Eventy:
        var jqCheckbox = row.jqRow.find('.flink-checkbox-input');
        var jqSortBtn  = row.jqRow.find('.basic-table-sort-button');
        var jqPaths    = row.jqRow.find('.flink-table-path');

        // Zapobieganie dodawaniu entera.
        jqPaths.keypress(function(e){ return e.which !== 13; });
        jqPaths.on('input', this._jqEventPathInputValidation);
        jqPaths.on('paste', this._jqEventRemoveContenteditableFormatingOnPaste);
        jqPaths.on('dblclick', this._jqEventOpenDialog);

        jqCheckbox.on('change', this._jqEventCheckbox);
        jqSortBtn.on('click', this._jqEventSort);

        // Podpiecie do menu kontekstowych:
        this.rowContextMenu.addListener(row.jqRow);
        this.pathContextMenu.addListener(jqPaths);

        // Podpięcie rzędu do tablicy:
        this.jqLinkTable.append(row.jqRow);

        // Zachowanie obiektu rzędu:
        this.rows.push(row);

        // Inicializacja:
        this._validateRowOfPaths(row);
        this._autoManageRows();
    }

    constructor(options = {}){
        // Przygotowanie tablicy:
        this._createFolderLinkTable(options);

        // Menu kontekstowe wierszów:
        this.rowContextMenu = new ContextMenu([{ 
                label: `${webFonts.trash} ${variousText.removeRow}`,
                click: this._ctxMenuRemove.bind(this),
                validator: this._ctxMenuRowValidator.bind(this),
            }
        ]);
        // Menu kontekstowe wierszów:
        this.pathContextMenu = new ContextMenu([{ 
                label: `${webFonts.trash} ${variousText.removeRow}`,
                click: this._ctxMenuRemove.bind(this),
                validator: this._ctxMenuRowValidator.bind(this),
            },{ 
                label: `${webFonts.maximize} ${variousText.showInExplorator}`,
                click:  this._ctxMenuShowFolder.bind(this),
                validator: this._ctxMenuPathValidator.bind(this),
                validateOn: ['input'],
            },{ 
                label: `${webFonts.list} ${variousText.showContents}`,
                click:  this._ctxMenuShowContents.bind(this),
                validator: this._ctxMenuPathValidator.bind(this),
                validateOn: ['input'],
            }
        ]);

        // Tablica na rzędy tablicy:
        this.rows = [];

        // Inicializacja stanu wierszy.
        this._autoManageRows();
    }

    //------------------- INNE FUNKCJE API:

    // Ponownie waliduje wszystkie wiersze.
    validateAll(){
        var oneOrMoreChanged = false;
        for(const row of this.rows){
            const isGoodBefore = row.isGood;
            this._validateRowOfPaths(row);
            const isGoodAfter = row.isGood;
            if(isGoodBefore !== isGoodAfter)
                oneOrMoreChanged = true;
        }
        if(oneOrMoreChanged){
            appEventEmitter.emit('user-input');
        }
    }
    // Zwraca wszystkie dane w surowej postaci (jak widać w tabeli).
    getData(){
        var data = [];

        // Zebranie danych:
        this.rows.forEach((row)=>{
            data.push({
                "source":    row.source.text,
                "target":    row.target.text,
                "isChecked": row.isChecked
            });
        });
        // Bez pustego wiersza.
        data.pop();

        return data;
    }
    // Czyści tablicę i wpisuje nowe dane
    loadData(data){
        // Czyszczenie:
        var rows = [...this.rows];
        rows.forEach((row)=>{
            this._removeRow(row);
        },this);

        // Dodawanie nowych danych:
        data.forEach((d)=>{
            this.appendRow(d);
        },this);

        // Uruchomienie managera na wypadek jeśli,
        // wczytano pusty plik zapisu.
        this._autoManageRows();
    }
    // Zwraca zaznaczone wiersze lub wyświetla komunikat o błedzie.
    // Ścieżki są formatowane funkcją podmieniającą wyrażenia regularne.
    // Jeśli kilka folderów docelowych ma te same źródłó to są grupowane.
    getFolderLinks(){
        var data           = [];
        var dataNotGrouped = [];
        var errors = '';

        // Zebranie danych:
        var obj = this;
        this.rows.forEach((row, i)=>{
            if(row.isChecked && !row.isEmpty) {
                var source = row.source.path;
                var target = row.target.path;
                if(row.isGood) {
                    // Dopisanie danych bez grupowania (na cele walidacji).
                    dataNotGrouped.push({ "source": source, "target": target });
                    // Dopisanie danych z grupowaniem po tym samym źródle.
                    var sameSource = data.find(function(o){
                        return obj._arePathsEqual(o.source, source); })  
                    if(sameSource !== undefined)
                        sameSource.targets.push(target);
                    else 
                        data.push({ "source": source, "targets": [target] });
                }
                else {
                    // Dopisanie błędu do listy.
                    source = (row.source.text.length > 0) ? source : '...';
                    target = (row.target.text.length > 0) ? target : '...';
                    errors += `[${i+1}] ${source} -> ${target}\n`;
                }
  
            }
        });
        // Komunikat o błędzie:
        if(errors.length > 0) {
            dialog.showMessageBox(win, {
                type: "warning",
                title: ' ' + variousText.errorInFolderLinkTable,
                message: variousText.errorsInRows,
                detail: errors
            });
            return null;
        }
        // Dobre wyniki.
        else {
            if(data.length === 0){
                return [];
            }
            else if(this._validateLinkLogic(dataNotGrouped) === false){
                return null;
            }
            else {
                return data;
            }
        }
    }

    // Zwra obiekt jQuery tabeli.
    getJQ(){
        return this.jqTableWrapper;
    } 
}

//-------------- Export -------------//

module.exports = BasicTableSelfGrowing;