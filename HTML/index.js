//---------------- POBRANIE MODUŁÓW ------------------//
"use strict";

// Moduły GUI:
const BasicModal      = require('./gui-modules/basic-modal');
const ProgressDialog  = require('./gui-modules/progress-dialog');
const BasicAppbar     = require('./gui-modules/basic-appbar');
const ContextMenu     = require('./gui-modules/context-menu');
const BasicCheckbox   = require('./gui-modules/basic-checkbox');
const BasicPagination = require('./gui-modules/basic-pagination');
const BasicTitlebar   = require('./gui-modules/basic-titlebar');
const SettingsDialog  = require('./gui-modules/settings-dialog');
const CEInput         = require('./gui-modules/contenteditable-input');
const BasicTableSG    = require('./gui-modules/basic-table-self-growing');

// Moduły NodeJs:
const fs                    = require('fs');
const path                  = require('path');
const os                    = require('os');
const url                   = require('url');
const _                     = require('lodash');
const prettyBytes           = require('pretty-bytes');
const prettyMilliseconds    = require('pretty-ms');
const mime                  = require('mime');
const moment                = require('moment');
const dir                   = require('./../my_modules/fs-dirs');
const EventEmitter          = require('events');
const $                     = require('jquery');
const jsonfile              = require('jsonfile');

// Moduły ElectronJS:
const electron      = require('electron');
const shell         = electron.shell;
const dialog        = electron.remote.dialog;
const app           = electron.remote.app;
const ipcRenderer   = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;
const win           = electron.remote.getCurrentWindow();

// Lokalizacja folderu i dysku uruchomienia apliakcji.
const exeDir = path.dirname(app.getPath('exe'));
const runningDisc = exeDir.split(path.sep)[0];
// process.env.PORTABLE_EXECUTABLE_DIR
//execPath = path.dirname(electron.remote.process.execPath);

//app.getPath()
const execPath = path.dirname(electron.remote.app.getPath('exe'));



// window.onbeforeunload = (e) => {
//     console.log('I do not want to be closed')
//   }


//------------- OBSŁUGA NIEZŁAPANYCH WYJĄTKÓW------------//

window.onerror = function (msg, url, line) {
    dialog.showErrorBox(
        'Unhandled exception',
        "url: " + url + '\n' +
        "Line number: " + line + "\n" +
        "Message: " + msg
    );
}

//------------- WEBFONTY I JĘZYK APLIKACJI------------//

moment.locale('pl');

const webFonts = {
    'AM': '<span class="icomoon-icon-am-logo"></span>',

    'folderOpen': '<i class="fas fa-folder-open"></i>',
    'trash': '<i class="fas fa-trash"></i>',
    'angleUp': '<i class="fas fa-angle-up"></i>',
    'angleDown': '<i class="fas fa-angle-down"></i>',
    'angleLeft': '<i class="fas fa-angle-left"></i>',
    'angleDblRight': '<i class="fas fa-angle-double-right"></i>',
    'angleDblLeft': '<i class="fas fa-angle-double-left"></i>',
    'angleRight': '<i class="fas fa-angle-right"></i>',
    'download': '<i class="fas fa-download"></i>',
    'clock': '<i class="fas fa-clock"></i>',
    'calendar': '<i class="fas fa-calendar-alt"></i>',
    'plus': '<i class="fas fa-plus"></i>',
    'hdd': '<i class="fas fa-hdd"></i>',
    'sdCard': '<i class="fas fa-sd-card"></i>',
    "folderMinus": '<i class="fas fa-folder-minus"></i>',
    "folderPlus": '<i class="fas fa-folder-plus"></i>',
    'link': '<i class="fas fa-link"></i>',
    'unlink': '<i class="fas fa-unlink"></i>',
    'sync': '<i class="fas fa-sync-alt"></i>',
    'copy': '<i class="fas fa-copy"></i>',
    'trashAlt': '<i class="fas fa-trash-alt"></i>',
    'share': '<i class="fas fa-share-square"></i>',
    'arrowRight': '<i class="fas fa-arrow-right"></i>',
    'music': '<i class="fas fa-music"></i>',
    'code': '<i class="fas fa-code"></i>',
    'font': '<i class="fas fa-font"></i>',
    'image': '<i class="fas fa-image"></i>',
    'cubes': '<i class="fas fa-cubes"></i>',
    'film': '<i class="fas fa-film"></i>',
    'folder': '<i class="fas fa-folder"></i>',
    'maximize': '<i class="far fa-window-maximize"></i>',
    "database": '<i class="fas fa-database"></i>',
    'file': '<i class="fas fa-file"></i>',
    'fileAlt': '<i class="fas fa-file-alt"></i>',
    'fileCode': '<i class="fas fa-file-code"></i>',
    "filePdf": '<i class="fas fa-file-pdf"></i>',
    'fileVideo': '<i class="fas fa-file-video"></i>',
    'fileWord': '<i class="fas fa-file-word"></i>',
    'filePowerpoint': '<i class="fas fa-file-powerpoint"></i>',
    'fileImage': '<i class="fas fa-file-image"></i>',
    'fileExcel': '<i class="fas fa-file-excel"></i>',
    'fileCode': '<i class="fas fa-file-code"></i>',
    'fileAudio': '<i class="fas fa-file-audio"></i>',
    'fileArchive': '<i class="fas fa-file-archive"></i>',
    'fileCsv': '<i class="fas fa-file-csv"></i>',
    'js': '<i class="fab fa-js"></i>',
    'html5': '<i class="fab fa-html5"></i>',
    'css3': '<i class="fab fa-css3-alt"></i>',
    'php': '<i class="fab fa-php"></i>',
    'icons': '<i class="fas fa-icons"></i>',
    'th': '<i class="fas fa-th"></i>',
    'cog': '<i class="fas fa-cog"></i>',
    'video': '<i class="fas fa-video"></i>',
    'info': '<i class="fas fa-info"></i>',
    'ban': '<i class="fas fa-ban"></i>',
    'spinnerSpin': '<i class="fas fa-spinner fa-spin"></i>',
    'spinnerPulse': '<i class="fas fa-spinner fa-pulse"></i>',
    'cogSpin': '<i class="fas fa-cog fa-spin"></i>',
    'frown': '<i class="far fa-frown"></i>',
    'smile': '<i class="far fa-smile"></i>',
    'search': '<i class="fas fa-search"></i>',
    'database': '<i class="fas fa-database"></i>',
    'poll': '<i class="fas fa-poll-h"></i>',
    'skull': '<i class="fas fa-skull-crossbones"></i>',
    'list': '<i class="fas fa-list"></i>',
    'mapMarker': '<i class="fas fa-map-marker-alt"></i>',

    'question': '<i class="fas fa-question"></i>',
    'infoCircle': '<i class="fas fa-info-circle"></i>',
    'idCard': '<i class="fas fa-id-card"></i>',

    'dolly': '<i class="fas fa-dolly"></i>',
    'keyboard': '<i class="fas fa-keyboard"></i>',
};
const variousText = {
    'sourceFolder': "Folder źródłowy",
    'targetFolder': "Folder docelowy",
    'id': 'ID',
    'enteredWrongPath': " Scieżka nie istnieje, nie wskazuje na folder, lub jest strzeżona!",
    'errorsInRows': 'Nie można porównać folderów gdyż, następujące połączenia są błędne:',
    'error': 'Błąd!',
    'errorInFolderLinkTable': 'Błąd w tabeli połączeń folderów!',
    'folderDontExist': "Taki folder nie istnieje na tym komputerze:",
    'clickTwiceChooseSourceFolder': "Kliknij dwukrotnie by wybrać folder źródłowy...",
    'clickTwiceChooseTargetFolder': "Kliknij dwukrotnie by wybrać folder docelowy...",
    'synchronizeThisFolders': "Włącza/wyłącza synchronizację tych folderów.",
    'chooseFolder': 'Nie wprowadzono ścieżki',
    'pathsAreTheSame': 'Ścieżki w rzędzie nie mogą być takie same!',
    'removeRow': 'Usuń wiersz',
    'targetExistsAndIsntASymlink': 'Taka ścieżka już istnieje i nie jest połączeniem symbolicznym!',
    'size': 'Rozmiar',
    'modificationDate': 'Data modyfikacji',
    'sourceFile': 'Plik źródłowy',
    'targetFile': 'Plik docelowy',
    'sizeDiff': 'Zmiana rozmiaru',
    'type': 'Typ',
    'symLink': 'Połączenie symboliczne',
    'folder': 'Folder',
    'trashBin': 'Usunięcie',
    'failedToOpen': 'Nie udało się otworzyć:',
    'targetPath': 'PLIK DOCELOWY',
    'updatingFile': 'NADPISYWANY PLIK',
    'movingFile': 'NOWA LOKALIZACJA',
    'renamingFile': 'NOWA ŚCIEŻKA',
    'showInFolder': 'Pokaż w katalogu',
    'showInExplorator': 'Pokaż w eksploratorze',
    'showContents': 'Wyświetl zawartość',
    'listOfOperationsWillBeShownHere': 'W tym miejscu pojawi się lista operacji,<br>które zostaną wykonane na plikach.',
    'pleaseWait': 'Proszę czekać...',
    'noFilesToDisplay': 'Brak plików do wyświetlenia.',
    'settings': 'Ustawienia',
    'synchronize': 'Synchronizuj',
    'compareFolders': 'Porównaj Foldery',
    'comparesFolders': 'Porównuje nazwę, rozmiar i czas modyfikacji wszystkich plików w folderach.',
    'opensSettings': 'Otwiera okienko z dodatkowymi ustawieniami.',
    'youNeedToCompareBeforeSync': 'Przed synchronizacją, należy porównać foldery!',
    'syncsFolders': 'Doprowadza foldery do jednakowego stanu.',
    'sortByColumn': 'Sortuj ze względu na tą kolumnę',
    'nothingToCompare': 'Brak folderów do porównania!',
    'linkTableIsEmptyOrNothingSelected': 'Tablica połączeń folderów jest pusta, lub nie wybrano żadnego połączenia!',
    'foldersContentsAreEqual': 'Porównane foldery, są takie same!',
    'open': 'Otwórz',

    'copying': 'Kopiowanie',
    'update': 'Aktualizacja',
    'removal': 'Usunięcie',
    'renaming': 'Zmiana nazwy',
    'moving': 'Przeniesienie',
    'preview': 'Podgląd',

    // 
    'followingSyscallsFailed': 'Następujących operacji nie udało się wykonać!',

    //
    'folder': 'Folder',
    'reason': 'powód',
    'inRows': 'w wierszach',
    'fromRow': 'z wiersza',
    'author': 'Autor',
    'about': 'O programie',

    // Przeglądanie folderów.
    'walkingFolder': 'Przeglądanie folderu',
    'walkingFolders': 'Przeglądanie folderów',
    'filesFound': 'Znaleziono plików',
    'foldersFound': 'Znaleziono folderów',
    'encounteredErrors': 'Napotkane problemy',
    'summary': 'Podsumowanie',
    'finished': 'Zakończono!',
    'walkingMayTakeAWhile': 'Uwaga: Przeglądanie folderu z wieloma plikami, może chwilę potrwać.',
    'walkingDone': 'Zakończono przeglądanie folderu.',
    'walkingHadErrors': 'Niektórych plików lub folderów nie udało się odczytać!',
    'pleaseWaitWalkingInProgress': 'Proszę czekać, trwa przeglądanie folderu...',
    

    // Porównywanie folderów.
    'comparingFolders': 'Porównywanie folderów',
    'comparingMayTakeAWhile': 'Uwaga: Porównywanie folderów z wieloma plikami, może chwilę potrwać.',
    'comparingDone': 'Zakończono porównywanie folderów.',
    'comparingHadErrors': 'Niektórych plików lub folderów nie udało się odczytać!',
    'pleaseWaitComparingInProgress': 'Proszę czekać, trwa porównywanie folderów...',
    
    // Synchronizacja folderów:
    'copiedTotal': 'Skopiowano',
    'copiedLast': 'Ostatni skopiowany',
    'removedTotal': 'Usunięto',
    'removedLast': 'Ostatni usunięty',
    'movedTotal': 'Przeniesiono',
    'movedLast': 'Ostatni przeniesiony',
    'skipped': 'Pominięto',
    'copyingFiles': 'Kopiowanie plików',
    'removingFiles': 'Usuwanie plików',
    'movingFiles': 'Przenoszenie plików',
    'processedFiles': 'Synchronizowane pliki',
    'pleaseWaitSyncInProgress': 'Proszę czekać, trwa synchronizowanie folderów...',
    'syncingMayTakeAWhile': 'Uwaga: Synchronizowanie wielu zmian, może chwilę potrwać.',
    'syncDone': 'Zakończono synchronizowanie folderów.',
    'syncHadErrors': 'Niektórych plików/folderów nie udało się zmodyfikować!',
    'compareAgain': 'Ponownie porównaj foldery',
    'syncNevertheless': 'Synchronizuj mimo to',
    'warning': 'Ostrzeżenie!',
    'syncDataMayBeOutdated': 'Uwaga: ustawienia synchronizacji mogą nie być aktualne.',
    'changesWereMade': 'Wprowadzono zmiany w ustawieniach, od ostatniego porównania folderów!',

    'welcome': 'Witaj',
    'sinceLastSync': 'Ostatnia synchronizacja',
    'noData': 'brak danych',

    // Ustawienia:
    'followSymbolicLinks': 'Podążaj za połączeniami symbolicznymi',
    'followSymbolicLinksAbout': 'Połączenia symboliczne będą traktowane, tak jak by były wskazywanym przez nie plikiem lub folderem.',
    'keepRelativeSymbolicLinks': 'Zachowaj względne połączenia symboliczne',
    'keepRelativeSymbolicLinksAbout': 'Połączenia symboliczne wskazujące na plik lub folder tego samego dysku, po skopiowaniu będą wskazywać na tą samą ścieżkę, lecz dysku docelowego.',
    'useJunctionsForSymlinks': "Twórz połączenia symboliczne: junction",
    'useJunctionsForSymlinksAbout': 'Wszystkie kopiowane połączenia symboliczne będą tworzone z flagą /J tz. w trybie junction.',
    'maxAllowedMtimeDiff': 'Maksymalna różnica czasu modyfikacji',
    'maxAllowedMtimeDiffAbout': 'Różnica czasu modyfikacji plików o tym samym rozmiarze, konieczna do wykonania aktualizacji (minimum 1 ms).',
    'useSystemIcons': 'Użyj systemowych grafik plików',
    'useSystemIconsAbout': 'Obok plików zamiast ikonek, zostaną pokazane systemowe grafiki związane z typem danego pliku.',
    'detectFileMoving': 'Wykrywaj przenoszenie plików',
    'detectFileMovingAbout': 'W oparciu o rozmiar, czas modyfikacji i dane (w przypadku konfilktów), będzie wykrywana zmiana lokalizacji pliku w folderze.',
    'detectFileRenaming': "Wykrywaj zmiany nazw plików",
    'detectFileRenamingAbout': "W oparciu o rozmiar, czas modyfikacji i dane (w przypadku konfilktów), będzie wykrywana zmiana nazwy pliku w folderze.",
    'detectFileRenamingWhileMoving': "Wykrywaj zmiany nazw przenoszonych plików",
    'detectFileRenamingWhileMovingAbout': "Podczas wykrywania zmian nazw plików, nie będzie wymagane, by plik znajdował się w tym samym folderze co wcześniej.",

    // Błędy logiczne: multipleSyncTargets
    'nonIndependentSources': "Jeden lub więcej folderów źródłowych,\njest wykorzystanych pośrednio lub bezpośrednio jako foldery docelowe:",
    'multipleSyncTargets': "Jeden lub więcej folderów docelowych,\njest pośrednio lub bezpośrednio wielokrotnie synchronizowanych:",
    'folderLinksLogicErrors': "Część połączeń między folderami jest nieprawidłowa!\nPoniżej wypisano szczegółowe informacje:",
};
const errorCodeText = {
    "EPERM": "wymaga wykonania w trybie administratora",
    "EACCES": "próba dostępu do chronionego pliku lub folderu",
    "EEXIST": "próba nadpisania istniejącego pliku",
    "ENOENT": "dany plik lub folder już nie istnieje",
};
const errorSyscallText = {
    "symlink": "Stwórz połączenie symboliczne",
    "unlink": "Usuń plik lub połączenie symboliczne",
    "copyfile": "Skopiuj plik",
    "mkdir": "Stwórz folder",
    "rmdir": "Usuń folder",
    "readdir": "Wyświetl zawartość folderu",
    "lstat": "Odczytaj informację o pliku, folderze lub połączeniu symbolicznym",
    "stat": "Odczytaj informację o pliku lub folderze",
};


//--------------- GLOBALNY EVENTEMITTER ---------------//

const appEventEmitter = new EventEmitter();

//---------------- KLASY OBIEKTÓW W GUI ---------------//

/* Klasa zarządzająca tablicą połączeń folderów */
class FolderLinkTable{

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


/* Tablica podsumuwująca jakie operacje zostaną wykonane na plikach */
class FileTransferTable{

    // ZMIENNE:
    lastSortBy     = null
    inputType      = null
    useSystemIcons = false


    // ----------- OBSŁUGA EVENTÓW:

    // Obsługa menu kontekstowego.
    _ctxMenuShowInFolder(jqObj){
        var path  = jqObj.data('path');

        if(!shell.showItemInFolder(path)){
            dialog.showMessageBox(win, {
                type: "warning",
                title: variousText.error,
                message: variousText.failedToOpen,
                detail: path
            });
        }
    }
    // Obsługa menu kontekstowego.
    _ctxMenuOpenFile(jqObj){
        var path  = jqObj.data('path');

        if(!shell.openItem(path)){
            dialog.showMessageBox(win, {
                type: "warning",
                title: variousText.error,
                message: variousText.failedToOpen,
                detail: path
            });
        }
    }
    // Kliknięcie w nazwę pliku.
    _jqEventFilenameClick(){
        var jqObj = $(this);
        var type  = jqObj.data('type');
        var path  = jqObj.data('path');
        
        var shellFun;
        if(type === 'file')
            shellFun = shell.openItem;
        else
            shellFun = shell.showItemInFolder;

        if(!shellFun(path)){
            dialog.showMessageBox(win, {
                type: "warning",
                title: variousText.error,
                message: variousText.failedToOpen,
                detail: path
            });
        }
    }

    // ----------- PRZYGOTOWYWANIE ZAWARTOŚCI WIERSZY:

    // Przygotowuje string do sortownaia.
    _normalizeStringForSorting(str){
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    // Formatuje rozmiar (zmianę rozmiaru) w bajtach
    // do ładnej postaci.
    _formatSize(bytes, describesChange = false){
        var text = prettyBytes(
            bytes, {locale: true, signed: describesChange});
        if (describesChange && bytes > 0)
            return `<span class="ftransfer-color-safe">${text}</span>`;
        else if (describesChange && bytes < 0)
            return `<span class="ftransfer-color-danger">${text}</span>`;
        else
            return text;
    }
    // Formatuje zmianę czasu w milisekundach do ładnej postaci.
    _formatMilliseconds(mscs){
        var text = prettyMilliseconds(
            Math.abs(mscs), {compact: true});
        if (mscs > 0)
            return `<span class="ftransfer-color-safe">${text}</span>`;
        else if (mscs < 0)
            return `<span class="ftransfer-color-danger">${text}</span>`;
        else
            return text;
    }
    // Formatuje datę do ładnej postaci.
    _formatDate(date){
        return moment(date).format('DD MMM YYYY HH:mm');
    }
    // Formatuje ścieżkę pliku do ładnej postaci.
    _formatFileName(fun, _path){
        var text = path.basename(_path);
        switch(fun){
            case 'add':     return `<span class="ftransfer-filename ftransfer-color-safe">${text}</span>`;
            case 'move':    return `<span class="ftransfer-filename ftransfer-color-neutral">${text}</span>`;
            case 'rename':  return `<span class="ftransfer-filename ftransfer-color-neutral2">${text}</span>`;
            case 'update':  return `<span class="ftransfer-filename ftransfer-color-warning">${text}</span>`;
            case 'remove':  return `<span class="ftransfer-filename ftransfer-color-danger">${text}</span>`;
            default:        return `<span class="ftransfer-filename">${text}</span>`;
        }
    }
    // Zwraca ikonę danej akcji przeprowadzanej na plikach
    // lub folderach (usuwanie, dodawanie, aktualicacja).
    _getFunIcon(type, fun){ 
        var icon = FileTransferTable.icons.funs[type][fun || 'info'];
        switch(fun){
            case 'add':     return `<span class="ftransfer-color-safe" title="${variousText.copying}">${icon}</span>`;
            case 'move':    return `<span class="ftransfer-color-neutral" title="${variousText.moving}">${icon}</span>`;
            case 'rename':  return `<span class="ftransfer-color-neutral2" title="${variousText.renaming}">${icon}</span>`;
            case 'update':  return `<span class="ftransfer-color-warning" title="${variousText.update}">${icon}</span>`;
            case 'remove':  return `<span class="ftransfer-color-danger" title="${variousText.removal}">${icon}</span>`;
            default:        return `<span title="${variousText.preview}">${icon}</span>`;
        }
    }
    // Zwraca ikonkę typu pliku w oparciu o ścieżke,
    // i typ (czy jest plikiem, folderem czy połączeniem).
    _getFileIcon(type, _path){
        var icon; var title = '';
        if (type === 'link') {
            icon = webFonts.link;
            title = variousText.symLink;
        }
        else if (type === 'dir') {
            icon = webFonts.folder;
            title = variousText.folder;
        }
        else {
            // Określenie typu MIME:
            var ext   = path.extname(_path);
            var title = mime.getType(ext);
            // Jeśli brak MIME brane jest samo rozszerzenie.
            if(title === null) title = `*${ext}`;
            else title = `*${ext}, ${title}`;

            // Znalezienie najlepszej ikonki w bazie:
            var icons = FileTransferTable.icons.files;
            var keys  = Object.keys(icons);
            for(let i = 0; i < keys.length; i++){
                if(title.includes(keys[i])){
                    icon = icons[keys[i]];
                    break;
                }
            }
            if(icon === undefined)
                icon = icons['default'];
        }    
        return `<span title="${title}">${icon}</span>`;
    }
    // Zwraca indentyfikator typu zawartości rzędu.
    _getRowLabel(fun){
        switch(fun){
            case 'add':     return `safe`;
            case 'move':    return `neutral`;
            case 'rename':  return `neutral2`;
            case 'update':  return `warning`;
            case 'remove':  return `danger`;
            default:        return `default`;
        }
    }
    // Zwraca wartość dla sortowania po funkcji wg niebezpieczeństwa operacji.
    _getSortingFun(type, fun){
        var a = 0; var b = 0;
        switch(type){
            case 'file': a = 2; break;
            case 'link': a = 1; break;
            case 'dir':  a = 0; break;
        }
        switch(fun){
            case 'remove': b = 4; break;
            case 'update': b = 3; break;
            case 'rename': b = 2; break;
            case 'move':   b = 1; break;
            case 'add':    b = 0; break;
        }
        return b*3 + a;
    }
    // Generuje wszystkie dane potrzebne by później stworzyć obiekt jQuery.
    _createRowData(syncData){
        // Domyślne parametry:
        var row = {
            label: '',
            icon: { fun: '', file: '' },
            A: {
                title: '', name: '', 
                date: '',  size: '', 
                data: '',
            },
            B: {
                title: '', name: '', 
                time: '',  size: '', 
                data: '',
            },
            sorting:{
                fun: '',
                name: '',
                name2: '',
                ext: '',
                date: -1,
                dateDiff: -1,
                size: -1,
                sizeDiff: -1,
            }
        }

        // Zmienne pomocnicze:
        var source; var target;
        if(syncData.target === undefined){
            // (Dla podglądu folderu)
            source = syncData.stat;
        }
        else if (syncData.fun === 'remove') {
            source = syncData.target;
        } else {
            source = syncData.source;
            target = syncData.target;
        }

        // Dla plików można ew. pobrać ikonę przez app.getFileIcon()
        if(syncData.type === 'file'){
            row.filePath = source.path;
        }

        // 0. Zachowanie potrzebnych wartości:
        row.sorting.fun = this._getSortingFun(syncData.type, syncData.fun);
        row.label = this._getRowLabel(syncData.fun);

        // 1. Określenie ikonek w wierszu:
        row.icon.fun  = this._getFunIcon(syncData.type, syncData.fun);
        row.icon.file = this._getFileIcon(syncData.type, source.path);

        // 2. Formatowanie informacji w pierwszej części tabeli.
        row.sorting.ext  = path.extname(source.path);
        row.sorting.name = path.basename(source.path, row.sorting.ext);
        row.sorting.ext  = this._normalizeStringForSorting(row.sorting.ext);
        row.sorting.name = this._normalizeStringForSorting(row.sorting.name);
        row.sorting.date = source.mtime;
        row.A.name  = this._formatFileName((syncData.fun === 'remove') ? 'remove' : null, source.path);
        row.A.date  = this._formatDate(new Date(source.mtime));
        if(syncData.type !== 'dir') {
            row.sorting.size = source.size;
            row.A.size  = this._formatSize(source.size);
        }
            
        // 3. Formatowanie informacji w drugiej części tabeli.
        if(syncData.target === undefined){
            // (Dla podglądu folderu)
        }
        else if(target !== undefined ) { // ADD i UPDATE
            row.sorting.name2 = row.sorting.name;
            row.B.name  = this._formatFileName(syncData.fun, target.path);
            if (syncData.fun === 'add' && syncData.type !== 'dir'){
                row.sorting.sizeDiff = source.size; // abs
                row.B.size  = this._formatSize(source.size, true);
            }
            else if(syncData.fun === 'update') {
                row.sorting.dateDiff = Math.abs(source.mtime - target.mtime);
                row.sorting.sizeDiff = Math.abs(source.size - target.size);
                row.B.time  = this._formatMilliseconds(source.mtime - target.mtime);
                row.B.size  = this._formatSize(source.size - target.size, true);
            }
        }
        else { // REMOVE
            row.sorting.sizeDiff = source.size; //abs
            row.B.size  = this._formatSize(-source.size, true);
            row.B.name  = `<span style="opacity: 0.5;">[${variousText.trashBin}]</span>`;
        }

        // 4. Określenie co napisać po najechaniu myszką.
        if (syncData.type === 'link') {
            row.A.title = ` title="${source.path} -> ${source.link}" `;
            if(target !== undefined) {
                row.B.title = ` title="${target.path} -> ${target.link}" `;
            }
        }
        else {
            row.A.title = ` title="${source.path}" `;
            if(syncData.fun === 'add'){
                row.B.title = ` title="[${variousText.targetPath}]: ${target.path}" `;
            }
            else if(syncData.fun === 'move'){
                row.B.title = ` title="[${variousText.movingFile}]: ${target.path}" `;
            }
            else if(syncData.fun === 'rename'){
                row.B.title = ` title="[${variousText.renamingFile}]: ${target.path}" `;
            }
            else if(syncData.fun === 'update'){
                row.B.title = ` title="[${variousText.updatingFile}]: ${target.path}" `;
            }
        }

        // 5. Dodatkowe atrybuty data.
        row.A.data = ` data-path="${source.path}" data-type="${syncData.type}" data-shell="true" `;
        if(syncData.fun === 'update') {
            row.B.data = ` data-path="${target.path}" data-type="${syncData.type}" data-shell="true" `;
        }

        return row;
    }

    // ----------- KONSTRUKCJA TABLICY I WIERSZY:

    // Tworzy tablicę zmian plików.
    _createTransferTable(){
        // HTML:
        this.jqTableWrapper = $(
            `<div class="ftransfer-table basic-table-with-pagination">
                <div class="basic-table"></div>
            </div>`);
        this.jqTransferTable = $(
            `<table>
                <tr class="basic-table-header">
                    <th data-sort="fun" class="basic-table-col-icon"></th>
                    <th class="basic-table-col-id">${variousText.id}</th>
                    <th data-sort="name">${variousText.sourceFile}</th>
                    <th data-sort="ext" class="basic-table-col-icon">${variousText.type}</th>
                    <th data-sort="size" class="basic-table-col-size">${variousText.size}</th>
                    <th data-sort="date" class="basic-table-col-date">${variousText.modificationDate}</th>
                    <th class="basic-table-col-arrow"></th>
                    <th data-sort="name2">${variousText.targetFile}</th>
                    <th data-sort="sizeDiff" class="basic-table-col-size">${webFonts.sdCard} ${webFonts.plus}</th>
                    <th data-sort="dateDiff" class="basic-table-col-time">${webFonts.clock} ${webFonts.plus}</th>
                </tr>
            </table>`
        );
        this.jqTableWrapper.find('.basic-table').append(this.jqTransferTable);

        // Dodanie tagów title dla dortowalnych.
        this.jqTransferTable.find('th[data-sort').each(function(){
            $(this).attr('title', variousText.sortByColumn);
        });

        // Podpiecie eventów.
        var obj = this;
        this.jqTransferTable.find('th[data-sort]').on('click', function(){
            obj._sortRowsByColumn($(this).attr('data-sort'));
        });
    }

    // Tworzy obiekt jQuery wiersza z przygotowanych danych.
    _createRowFromData(rowData, index){
        // HTML:
        var jqRow = $(
            `<tr class="basic-table-row ftransfer-table-row" data-label="${rowData.label}">
                <td class="ftransfer-fun-icon basic-table-col-icon">${rowData.icon.fun}</td>
                <td class="basic-table-col-id">${index}</td>
                <td ${rowData.A.data} class="basic-table-col-text" ${rowData.A.title}>${rowData.A.name}</td>
                <td class="basic-table-col-icon"><div class="file-icon">${
                    (this.useSystemIcons && rowData.filePath !== undefined) ? '' : rowData.icon.file}</div></td>
                <td class="basic-table-col-size">${rowData.A.size}</td>
                <td class="basic-table-col-date">${rowData.A.date}</td>
                <td class="basic-table-col-arrow">${webFonts.arrowRight}</td>
                <td ${rowData.B.data} class="basic-table-col-text" ${rowData.B.title}>${rowData.B.name}</td>
                <td class="basic-table-col-size">${rowData.B.size}</td>
                <td class="basic-table-col-time">${rowData.B.time}</td>
            </tr>`
        );
        // Eventy:
        jqRow.find('td[data-shell]').on('click', this._jqEventFilenameClick);
        this.filenameCtxMenu.addListener(jqRow.find('td[data-shell]'));

        // Pobranie systemowej ikony dla pliku.
        if(this.useSystemIcons && rowData.filePath !== undefined){
            app.getFileIcon(rowData.filePath)
            .catch()
            .then((data)=>{
                const img = data.toDataURL();
                jqRow.find('.file-icon').html(`<img src="${img}">`);
            });
        }

        return jqRow;
    }

    // Tworzy wiersz placeholdera.
    _createPlaceholderRow(placeholderType){
        var icon; var msg;
        switch(placeholderType){
            case 'loading':
                icon = webFonts.spinnerPulse;
                msg  = variousText.pleaseWait;
                break;
            case 'empty':
                if(this.inputType === 'tasks'){
                    icon = webFonts.smile;
                    msg = variousText.foldersContentsAreEqual;
                }
                else {
                    icon = webFonts.frown;
                    msg = variousText.noFilesToDisplay;
                }
                break;
            default:
                icon = webFonts.folderOpen;
                msg  = variousText.listOfOperationsWillBeShownHere;
                break;
        }
        return $(
            `<tr class="basic-table-row"><td colspan="10">
                <div class="basic-table-placeholder-icon">${icon}</div>
                <div class="basic-table-placeholder-text">${msg}</div>
            </td></tr>`
        ) 
    }

    // ----------- ZARZĄDZANIE WYŚWIETLANIEM WIERSZY:

    // Opróżnia tabelę z wierszy danych w DOM-ie.
    _clearTable(){
        this.jqTransferTable.find('.basic-table-row').remove();
    }
    // Dodaje do tablicy wiersze z zakresu określoego przez range,
    _appendRowsFromDataRange(range){
        // Czyszczenie...
        this._clearTable();

        // Zapisanie obecnego zakresu.
        this.currentRange = range;
        // Wypisywanie danych...
        var jqTbody =  this.jqTransferTable.find('tbody');
        if(range !== null){
            this.jqTableWrapper.find('.basic-table').removeClass('basic-table-placeholder-mode');
            this.rowData.slice(range[0], range[1] + 1).forEach((data, i)=>{
                var jqRow = this._createRowFromData(data, range[0] + i + 1);    
                jqTbody.append(jqRow);
            }, this);
        }
        // Jeśli nie ma co wypisać do wypisany zostanie placeholder.
        else {
            this.jqTableWrapper.find('.basic-table').addClass('basic-table-placeholder-mode');
            jqTbody.append(this._createPlaceholderRow('empty'));
        }
    }
    // Reagowanie na informacje z paginatora.
    _paginationEventHandler(currentPage, currentRange){
        this._appendRowsFromDataRange(currentRange);
        this.jqTableWrapper.find('.basic-table').scrollTop(0);
    }

    // Sortowanie wierszy.
    _sortRowsByColumn(sortBy){
        if(this.rowData.length === 0) return;
        
        if(this.lastSortBy === sortBy) {
            this.rowData.reverse();
        }
        else{
            this.lastSortBy = sortBy;

            // Stringi (domyślnie alfabetycznie):
            if(sortBy === 'name' || sortBy === 'name2' || sortBy === 'ext') {
                this.rowData.sort(function(a, b){
                    if(a.sorting[sortBy] > b.sorting[sortBy]) return 1;
                    else if(a.sorting[sortBy] < b.sorting[sortBy]) return -1;
                    else return 0;
                });
            }
            // Liczby (domyślnie od większych wartości):
            else {
                this.rowData.sort(function(a, b){
                    return b.sorting[sortBy] - a.sorting[sortBy];
                });
            }
        }
        // Aktualizacja tablicy.
        this.pagination.setPage(1);
    }

    // ----------- RESZTA FUNKCJI:

    constructor(){
        // Tablica zmian plików:
        this._createTransferTable();

        // Paginacja:
        this.pagination = new BasicPagination();
        this.jqTableWrapper.append(this.pagination.getJQ());
        this.pagination.on('page-changed', 
            (...args)=>this._paginationEventHandler(...args));

        // Menu kontekstowe nazw plików:
        this.filenameCtxMenu = new ContextMenu([{  
                label: `${webFonts.file} ${variousText.open}`,
                click: this._ctxMenuOpenFile.bind(this)
            },{
                label: `${webFonts.maximize} ${variousText.showInFolder}`,
                click: this._ctxMenuShowInFolder.bind(this)
            },
        ]);

        // Miejsce na dane wierszy.
        this.rowData = [];

        // Inicializacja.
        this._clearTable(); 
        this.jqTableWrapper.find('.basic-table').addClass('basic-table-placeholder-mode');
        this.jqTableWrapper.find('tbody').append(this._createPlaceholderRow());
    }

    // Wyświetlenie loadingu.
    showLoadingPlaceholder(){
        this._clearTable(); 
        this.jqTableWrapper.find('.basic-table').addClass('basic-table-placeholder-mode');
        this.jqTableWrapper.find('tbody').append(this._createPlaceholderRow('loading'));
    }
    // Wyświetlenie domyślnego placeholdera.
    showDefaultPlaceholder(){
        this._clearTable(); 
        this.jqTableWrapper.find('.basic-table').addClass('basic-table-placeholder-mode');
        this.jqTableWrapper.find('tbody').append(this._createPlaceholderRow());
    }

    // Ustawienia trybu ikon
    useWebfontsAsFileIcons(useWebfonts = true){
        if(this.useSystemIcons !== !useWebfonts){
            this.useSystemIcons = !useWebfonts;
            this.refresh();
        }
    }
    // Odświerza zawartość tabeli
    refresh(){
        if(this.currentRange !== undefined){
            this._appendRowsFromDataRange(this.currentRange);
        }
    }
    // Wyświetla przygotowane dane.
    showData(){
        this.pagination.initPagination(
            this.rowData.length, 100
        );
    }

    // Importuje tablicę danych dotyczących zmian plików.
    // Przygotowuje na jej podstawie surowe dane do tworzenia,
    // wierszy i uruchamia manager budowania obiektów jQuery
    // tak by nie wyświetlać wszystkiego na raz (może być bardzo
    // dużo wierszy - połączenie z paginacją)
    importSyncData(syncTasks = [], onlyContents = false){
        // Czyszczenie...
        this.rowData = [];
        this.lastSortBy = null;

        // Przygotowanie "przepisów" na wiersze.
        if(onlyContents){
            this.inputType = 'contents';
            for(const type in syncTasks){
                for(const content of syncTasks[type]){
                    this.rowData.push(this._createRowData(content));
            }
        }}else{
            this.inputType = 'tasks';
            for(const type in syncTasks){
                for(const fun in syncTasks[type]){
                    for(const task of syncTasks[type][fun]){
                        this.rowData.push(this._createRowData(task));
            }}}
        }
        // Poinformowanie paginacji o liczbie danych.
        this.pagination.initPagination(
            this.rowData.length, 100
        );
        // Wstępne sortowanie po niebezpieczeństwie operacji.
        this._sortRowsByColumn('fun');
    }
    // Opróżnia tablę i czyści pamięć z zadań.
    empty(){
        this.importSyncData();
    }

    // Zwra obiekt jQuery tabeli.
    getJQ(){
        return this.jqTableWrapper;
    }
}
FileTransferTable.icons = {};
// Ikony dla różnych funkcji.
FileTransferTable.icons.funs = {
    "dir": {
        "add": webFonts.folderPlus,
        "remove": webFonts.folderMinus,
        "move": webFonts.dolly,
        "rename": webFonts.keyboard,
        "info": webFonts.folderOpen,
    },
    "file": {
        "add": webFonts.copy,
        "remove": webFonts.trash,
        "update": webFonts.sync,
        "move": webFonts.dolly,
        "rename": webFonts.keyboard,
        "info": webFonts.folderOpen,
    },
    "link": {
        "add": webFonts.copy,
        "remove": webFonts.trash,
        "update": webFonts.sync,
        "move": webFonts.dolly,
        "rename": webFonts.keyboard,
        "info": webFonts.folderOpen,
    }
}
// Ikony dla różnych typów plików.
FileTransferTable.icons.files = {
    // Dedykowane dla rozszerzenia.
    ".ini":          webFonts.icons, // Plik z danymi folderu.
    ".mts":          webFonts.video, // Inne niż mime (Dla mojego Sony HX100)

    // Szczegółowe.
    "compressed":   webFonts.fileArchive,
    "zip":          webFonts.fileArchive,

    "word":         webFonts.fileWord,
    "document":     webFonts.fileAlt,
    "powerpoint":   webFonts.filePowerpoint,
    "presentation": webFonts.filePowerpoint,
    "excel":        webFonts.fileExcel,
    "spreadsheet":  webFonts.fileExcel,
    "rtf":          webFonts.fileAlt,

    "icon":         webFonts.icons,
    "jpeg":         webFonts.image,

    "audio/mpeg":   webFonts.music,
    "wav":          webFonts.music,
    "flac":         webFonts.music,

    "audio/mpeg":   webFonts.film,
    "mp4":          webFonts.film,
    "wmv":          webFonts.film,
    "msvideo":      webFonts.film,
    "matroska":     webFonts.film,

    "javascript":   webFonts.js,
    "css":          webFonts.css3,
    "html":         webFonts.html5,
    'php':          webFonts.php,
    "csv":          webFonts.fileCsv,
    "bin":          webFonts.code,
    "exe":          webFonts.maximize, 
    "pdf":          webFonts.filePdf,
    "x-c":          webFonts.fileCode,

    // Bardziej ogólne.
    "application":  webFonts.fileCode,
    "audio":        webFonts.fileAudio,
    "font":         webFonts.font,
    "image":        webFonts.fileImage,
    "model":        webFonts.cubes,
    "text":         webFonts.fileAlt,
    "video":        webFonts.fileVideo,

    // Wartość domyślna.
    "default":      webFonts.file,

    // Specyficzne (nieznane dla MIME)
    "fst":          webFonts.fileCode,
    "flp":          webFonts.fileAudio,
    "nki":          webFonts.fileCode,
    "reg":          webFonts.th, 
    "nicnt":        webFonts.fileCode,
    "nkr":          webFonts.fileCode,
    "ncw":          webFonts.fileAudio,
    "nkc":          webFonts.fileCode,
    "nkr":          webFonts.fileArchive,
    "nkc":          webFonts.fileAudio,
}


/* Główna klasa aplikacji */
class MirrorDiscApp{
    // --------------------- UŻYWANE POLA:

    userdataPath           = path.join(exeDir, 'userdata.json')
    userdata               = null
    currentSyncTasks       = null
    syncTasksMayBeOutdated = false

    win                    = require('electron').remote.getCurrentWindow()

    // --------------------- URUCHAMIANIE I ZAMYKANIE:

    // Wczytanie danych użytkownika.
    _loadUserdata(){
        // Próba odczytu zapisanych danych użytkownika.
        try{
            this.userdata = jsonfile.readFileSync(this.userdataPath);
        } catch(err){ console.warn('FAILED TO LOAD USER DATA!'); this.userdata = {}; };

        // Domyślne wartości.
        _.defaults(this.userdata, {
            flinkTableData: [],
            lastSync: null,
            settings: {},
        })
        _.defaults(this.userdata.settings, {
            mtimeChangeThreshold: 1,
            followSymlink: false,
            keepRelativeSymlinks: true,
            useJunctionsForSymlinks: false,
            useSystemIcons: true,
            detectFileMoving: false,
            detectFileRenaming: false,
            detectFileRenamingWhileMoving: false,
        });

        // Załadowanie danych do GUI.
        this.flinkTable.loadData(this.userdata.flinkTableData);
        this.ftransferTable.useWebfontsAsFileIcons(!this.userdata.settings.useSystemIcons);
    }
    // Zachowanie danych użytkownika.
    _saveUserdata(){
        // Załądowanie danych do obiektu.
        this.userdata.flinkTableData = this.flinkTable.getData();

        // Próba zapisu danych.
        try{
            // Zapis z ładnym formatowaniem by plik był czytelny.
            jsonfile.writeFileSync(this.userdataPath, this.userdata, { spaces: 2, EOL: '\r\n' });
        } catch(err){ console.warn('FAILED TO SAVE USER DATA!'); console.error(err); };
    }

    // --------------------- FUNKCJE UTILITY:

    // Ładnie formatuje błędy.
    _formatErrors(rawErrors){
        // Podział błędów ze względu na code i syscall.
        const errors = {};
        rawErrors.forEach((e)=>{
            // Przygotowanie tablicy na błąd.
            if(errors[e.code] === undefined)
                errors[e.code] = {};
            if(errors[e.code][e.syscall] === undefined)
                errors[e.code][e.syscall] = [];
            // Zamiana kolejnosci dla połączeń symbolicznych by było źródło -> cel.
            if(e.syscall === 'symlink'){
                let temp = e.path;
                e.path = e.dest;
                e.dest = temp;
            }
            // Zapisanie informacji o tym co wywołało błąd.
            errors[e.code][e.syscall].push(
                `• "${e.path}"${(e.dest !== undefined) ? ` -> "${e.dest}"` : ''}`);
        });
        
        // Zbudowanie wiadomości.
        const messages = [];
        for(const code in errors){
            for(const syscall in errors[code]){
                const logs  = errors[code][syscall].join('\n');
                const count = errors[code][syscall].length;
                messages.push(`"${
                    (errorSyscallText[syscall] !== undefined) ?
                        errorSyscallText[syscall] : syscall}", ${variousText.reason}: "${
                    (errorCodeText[code] !== undefined) ?
                        errorCodeText[code] : code}". (${count})\n\n${logs}`
                );
            }
        }

        return messages.join('\n\n');
    }
    // Sprawdza czy są jakieś zlecenia synchronizacji w obiekcie.
    _needsSynchronization(syncTasks = {}){
        for(let type in syncTasks){
            for(let fun in syncTasks[type]){
                if(syncTasks[type][fun].length > 0) return true; }}
        return false;
    }

    // --------------------- RÓŻNE:

    // Usuwa wszystkie zapisane zadania i resetuje tabele.
    _clearTasks(){
        // Wyczyszczenie tabeli zadań.
        this.ftransferTable.empty();
        this.ftransferTable.showDefaultPlaceholder();
        // Wyczyszczenie zapisanych zadań.
        this.currentSyncTasks = null;
        this.syncTasksMayBeOutdated = false;
        // Zablokowanie guzika synchronizacji.
        this.appbar.getButton('sync').disable();
    }
    // Wczytuje nowe zadania synchronizacji do pamieci i tabeli.
    _loadTasks(syncTasks = {}){
        // Czyszczenie.
        this._clearTasks();

        // Zachowanie wyniku porównania.
        this.currentSyncTasks = syncTasks;
        this.syncTasksMayBeOutdated = false;

        // Załadowanie danych do tabeli:
        this.ftransferTable.showLoadingPlaceholder();
        this.ftransferTable.importSyncData(syncTasks);

        // Odblokowanie guzika synchronizuj jeśli są jakieś zadania.
        const syncButton = this.appbar.getButton('sync');
        if(this._needsSynchronization(syncTasks))
            syncButton.enable();
        else 
            syncButton.disable();
    }
    // Aktualizuje napisy w titlebarze.
    _updateTitlebar(){
        const lastSync = this.userdata.lastSync;
        const username = require("os").userInfo().username;

        const msgA = `${variousText.welcome} ${username}! ${variousText.sinceLastSync}`;

        if(lastSync === null){
            this.titlebar.setTitlebarInfo(`${msgA}: ${variousText.noData}.`);
        }
        else {
            this.titlebar.setTitlebarInfo(`${msgA}: ${moment(lastSync).fromNow()}.`);
        }
    }

    // --------------------- URUCHAMIANIE SKRYPTÓW:

    // Uruchomienie przeglądania folderu.
    _walkFolder(path){
        var contents = [];

        // Konfiguracja modalu stanu przeglądania folderów.
        var dialog = new ProgressDialog({
            'walk-summary': {
                type: 'message',
                header: [webFonts.poll, variousText.summary],
                text: variousText.walkingMayTakeAWhile,
            },
            'walk-fields': {
                type: 'fields',
                header: [webFonts.folderOpen, variousText.walkingFolder],
                fields: {
                    'current-folder': { title: variousText.folder, value: path },
                    'files': { title: variousText.filesFound },
                    'folders': { title: variousText.foldersFound },
                    'errors': { title: variousText.encounteredErrors },
                }
            },
        });
        var modal  = new BasicModal({
            width: 500,
            jqContent: dialog.getJQ(),
            icon: webFonts.cogSpin,
        });

        // Opcje do skryptu:
        var options = { abort: false, 
            followSymlink: this.userdata.settings.followSymlink,
            counter: {
                // Inicializacja by uniknąć w update undefined i NaN
                file: 0, dir: 0, link: 0, error: 0, bytes: 0, },
        };

        //--- FUNKCJE DLA MODALA PROGRESU ---
        var obj = this;
        dialog.initialize = function(){
            // Początkowa treść nagłówka modala.
            this.setTitle(variousText.pleaseWaitWalkingInProgress);
            this.startUpdates();

            // Wywołanie głównej funkcji porównywania folderów.
            dir.readDir(path, options).then(
                // Zakończono.
                (result)=>{
                     // Anulowano.
                    if(result === null){
                        contents = null;
                        this.setAsFinished();
                        dialog.onFinish();
                    }

                    contents = result; 
                    this.setTitle(variousText.finished, false);
                    this.setAsFinished();

                    const summary = this.segments['walk-summary'];
                    if(result.error.length > 0) {
                        summary.color = 'danger';
                        summary.text = variousText.walkingHadErrors;
                        summary.details = {
                            title: '',
                            message: variousText.followingSyscallsFailed,
                            detail: obj._formatErrors(result.errors),
                        };
                    }
                    else {
                        summary.color = 'safe';
                        summary.text = variousText.walkingDone;
                    }
                },
            );
        };
        dialog.onUpdate = function(){
            const fields    = this.segments['walk-fields'];
            const counter   = options.counter;

            // Statystyki przeglądania plików.
            fields['files'].value          = `${counter.file + counter.link} (${prettyBytes(counter.bytes)})`;
            fields['folders'].value        = counter.dir;
            fields['errors'].value         = counter.error;
        }
        dialog.onCancel = function(){
            options.abort = true;
        }
        dialog.onFinish = ()=>{
            modal.close();
            // Pozbycie się błędów i przesłanie danych dalej.
            delete contents.error;
            this._afterWalkFolders(contents);
        }
        modal.onCloseButton = ()=>{
            dialog.close();
        }

        // Uruchomienie modala i skryptu.
        modal.open();
        dialog.initialize();
    }
    // Wyświetlenie zawartości folderu w tablicy.
    _afterWalkFolders(contents){
        // Anulowano...
        if(contents === null) return;

        // Czyszczenie poprzednich danych.
        this._clearTasks();

        // Załadowanie danych do tabeli:
        this.ftransferTable.showLoadingPlaceholder();
        this.ftransferTable.importSyncData(contents, true);
    }
    // Uruchomienie porónywania folderów.
    _compareFolders(folderLinks = []){
        var foldersTotal = 0;
        folderLinks.forEach((r)=>foldersTotal+= r.targets.length + 1);

        var syncTasks = [];

        // Konfiguracja modalu stanu przeglądania folderów.
        var dialog = new ProgressDialog({
            'compare-summary': {
                type: 'message',
                header: [webFonts.poll, variousText.summary],
                text: variousText.comparingMayTakeAWhile,
            },
            'compare-fields': {
                type: 'fields',
                header: [webFonts.folderOpen, variousText.walkingFolders],
                fields: {
                    'current-folder': { title: variousText.folder },
                    'files': { title: variousText.filesFound },
                    'folders': { title: variousText.foldersFound },
                    'errors': { title: variousText.encounteredErrors },
                }
            },
            'compare-progress': {
                type: 'progress',
                header: [webFonts.search, variousText.comparingFolders]
            },
        });
        var modal  = new BasicModal({
            width: 500,
            jqContent: dialog.getJQ(),
            icon: webFonts.cogSpin,
        });

        // Opcje do skryptu:
        var options = { abort: false, 
            followSymlink: this.userdata.settings.followSymlink,
            keepRelativeSymlinks: this.userdata.settings.keepRelativeSymlinks,
            mtimeChangeThreshold: this.userdata.settings.mtimeChangeThreshold,
            detectFileMoving: this.userdata.settings.detectFileMoving,
            detectFileRenaming: this.userdata.settings.detectFileRenaming,
            detectFileRenamingWhileMoving: this.userdata.settings.detectFileRenamingWhileMoving,
            counter: {
                // Inicializacja by uniknąć w update undefined i NaN
                file: 0, dir: 0, link: 0, error: 0, bytes: 0,
                readdirCurrent: '', readdirDone: 0, 
                compareProgress: 0, compareProgressMax: 1, },
        };

        //--- FUNKCJE DLA MODALA PROGRESU ---
        var obj = this;
        dialog.initialize = function(){
            // Początkowa treść nagłówka modala.
            this.setTitle(variousText.pleaseWaitComparingInProgress);
            this.startUpdates();

            // Wywołanie głównej funkcji porównywania folderów.
            dir.getSyncTasks(folderLinks, options).then(
                // Zakończono.
                (result)=>{
                    syncTasks = result.tasks; 
                    this.setTitle(variousText.finished, false);
                    this.setAsFinished();

                    const summary = this.segments['compare-summary'];
                    if(result.errors.length > 0) {
                        summary.color = 'danger';
                        summary.text = variousText.comparingHadErrors;
                        summary.details = {
                            title: '',
                            message: variousText.followingSyscallsFailed,
                            detail: obj._formatErrors(result.errors),
                        };
                    }
                    else {
                        summary.color = 'safe';
                        summary.text = variousText.comparingDone;
                    }
                },
                // Anulowano.
                (reason)=>{
                    syncTasks = null;
                    this.setAsFinished();
                    dialog.onFinish();
                }
            );
        };
        dialog.onUpdate = function(){
            const fields    = this.segments['compare-fields'];
            const progress  = this.segments['compare-progress'];
            const counter   = options.counter;
            const readdirDone = Math.min(counter.readdirDone + 1, foldersTotal);

            // Statystyki przeglądania plików.
            fields['current-folder'].value = `${counter.readdirCurrent} [${readdirDone}/${foldersTotal}]`;
            fields['files'].value          = `${counter.file + counter.link} (${prettyBytes(counter.bytes)})`;
            fields['folders'].value        = counter.dir;
            fields['errors'].value         = counter.error;

            // Procentowy postęp porównywania.
            var progressVal = Math.min(
                counter.compareProgress / counter.compareProgressMax, 1);
            this.setWindowProgress(progressVal);
            progress.value = progressVal; 
        }
        dialog.onCancel = function(){
            options.abort = true;
        }
        dialog.onFinish = ()=>{
            modal.close();
            this._afterCompareFolders(syncTasks);
        }
        modal.onCloseButton = ()=>{
            dialog.close();
        }

        // Uruchomienie modala i skryptu.
        modal.open();
        dialog.initialize();
    }
    // Przetworzenie wyniku porónywania folderów.
    _afterCompareFolders(syncTasks = {}){
        // Anulowano...
        if(syncTasks === null) return;

        // Wczytanie danych do pamieci i tabeli.
        this._loadTasks(syncTasks);
    }
    // Uruchomienie synchronizacji folderów.
    _syncFolders(syncTasks = {}){
        // Konfiguracja okienka synchronizacji.
        var dialog = new ProgressDialog({
            'sync-summary': {
                type: 'message',
                header: [webFonts.poll, variousText.summary],
                text: variousText.syncingMayTakeAWhile,
            },
            'sync-fields': {
                type: 'fields',
                header: [webFonts.sync, variousText.processedFiles],
                fields: {
                    'copiedTotal': { title: variousText.copiedTotal },
                    'copiedLast': { title: variousText.copiedLast },
                    'removedTotal': { title: variousText.removedTotal },
                    'removedLast': { title: variousText.removedLast },
                    'movedTotal': { title: variousText.movedTotal },
                    'movedLast': { title: variousText.movedLast },
                    'errors': { title: variousText.encounteredErrors },
                }
            },
            'sync-remove-progress': {
                type: 'progress',
                header: [webFonts.trash, variousText.removingFiles]
            },
            'sync-copy-progress': {
                type: 'progress',
                header: [webFonts.download, variousText.copyingFiles]
            },
            'sync-move-progress': {
                type: 'progress',
                header: [webFonts.dolly, variousText.movingFiles]
            },
        });
        var modal  = new BasicModal({
            width: 500,
            jqContent: dialog.getJQ(),
            icon: webFonts.cogSpin,
        });


        // Opcje do skryptu:
        var options = { abort: false, 
            useJunctionsForSymlinks: this.userdata.settings.useJunctionsForSymlinks,
            counter: {
                // Inicializacja by uniknąć w update undefined i NaN
                copy: {
                    current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
                    total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
                },
                remove: {
                    current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
                    total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
                },
                move: {
                    current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
                    total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
                },
                errors: 0, }
        };

        //--- FUNKCJE DLA MODALA PROGRESU ---
        var obj = this;
        dialog.initialize = function(){
            // Początkowa treść nagłówka modala.
            this.setTitle(variousText.pleaseWaitSyncInProgress);
            this.startUpdates();

            // Wywołanie głównej funkcji synchronizowania folderów.
            dir.doSyncTasks(syncTasks, options).then(
                // Zakończono.
                (result)=>{
                    this.setTitle(variousText.finished, false);
                    this.setAsFinished();

                    const summary = this.segments['sync-summary'];
                    if(result.errors.length > 0) {
                        summary.color = 'danger';
                        summary.text = variousText.syncHadErrors;
                        summary.details = {
                            title: '',
                            message: variousText.followingSyscallsFailed,
                            detail: obj._formatErrors(result.errors),
                        };
                    }
                    else {
                        summary.color = 'safe';
                        summary.text = variousText.syncDone;
                    }
                },
                // Anulowano.
                (reason)=>{
                    this.setAsFinished();
                    dialog.onFinish();
                }
            );
        };
        dialog.onUpdate = function(){
            const counter         = options.counter;
            const fields          = this.segments['sync-fields'];
            const copyProgress    = this.segments['sync-copy-progress'];
            const removeProgress  = this.segments['sync-remove-progress'];
            const moveProgress    = this.segments['sync-move-progress'];

            // Dla wygody.
            const cc = counter.copy.current;
            const ct = counter.copy.total;
            const rc = counter.remove.current;
            const rt = counter.remove.total;
            const mc = counter.move.current;
            const mt = counter.move.total;
        
            // Indeksy kopiowanych / usuwanych plików.
            const copyID   = Math.min(ct.count + 1, ct.countMax);
            const removeID = Math.min(rt.count + 1, rt.countMax);
            const moveID   = Math.min(mt.count + 1, mt.countMax);

            // Statystyki przeglądania plików.
            fields['copiedTotal'].value  = `${copyID} / ${ct.countMax} (${prettyBytes(ct.size)} / ${prettyBytes(ct.sizeMax)})`;
            fields['copiedLast'].value   = `${cc.name} (${prettyBytes(cc.size)}/${prettyBytes(cc.sizeMax)}) ${(cc.error) ? webFonts.skull : ''}`;
            fields['removedTotal'].value = `${removeID} / ${rt.countMax} (${prettyBytes(rt.size)} / ${prettyBytes(rt.sizeMax)})`;
            fields['removedLast'].value  = `${rc.name} (${prettyBytes(rc.sizeMax)}) ${(rc.error) ? webFonts.skull : ''}`;
            fields['movedTotal'].value = `${moveID} / ${mt.countMax} (${prettyBytes(mt.size)} / ${prettyBytes(mt.sizeMax)})`;
            fields['movedLast'].value  = `${mc.name} (${prettyBytes(mc.sizeMax)}) ${(mc.error) ? webFonts.skull : ''}`;
            fields['errors'].value       = counter.errors;

            // Procentowy postęp porównywania (defaultTo by zardzić dzieleniu przez zero).
            var copyProgressVal   = _.defaultTo(Math.min(ct.size / ct.sizeMax, 1), 0);
            var removeProgressVal = _.defaultTo(Math.min(rt.count / rt.countMax, 1), 0);
            var moveProgressVal   = _.defaultTo(Math.min(mt.count / mt.countMax, 1), 0);

            // Jeśli nic nie trzeba robić to pasek ma być zapełniony.
            if(counter.initialized === true){
                if(ct.sizeMax === 0) copyProgressVal = 1;
                if(rt.countMax === 0) removeProgressVal = 1;
                if(mt.countMax === 0) moveProgressVal = 1;
            }

            // Update paska stanu.
            copyProgress.value   = copyProgressVal;
            removeProgress.value = removeProgressVal; 
            moveProgress.value   = moveProgressVal; 
            this.setWindowProgress((copyProgressVal + removeProgressVal + moveProgressVal) / 3);
        }
        dialog.onCancel = function(){
            options.abort = true;
        }
        dialog.onFinish = ()=>{
            modal.close();
            this._afterSyncFolders();
        }
        modal.onCloseButton = ()=>{
            dialog.close();
        }

        // Uruchomienie modala i skryptu.
        modal.open();
        dialog.initialize();
    }
    // Przetworzenie wyniku synchronizowania folderów.
    _afterSyncFolders(){
        // Czyszczenie.
        this._clearTasks();

        // Zapisanie informacji o synchronizacji.
        this.userdata.lastSync = Date.now();
        this._saveUserdata();
        this._updateTitlebar();
    }
    // Uruchamia okienko ustawień.
    _openSettings(){
        const userSettings = this.userdata.settings;

        // Konfiguracja modalu stanu przeglądania folderów.
        var dialog = new SettingsDialog({
            'mtimeChangeThreshold': {
                type: 'numeric',
                title: variousText.maxAllowedMtimeDiff,
                icon: webFonts.clock,
                detail: variousText.maxAllowedMtimeDiffAbout,
                value: userSettings.mtimeChangeThreshold,
                unit: 'ms',
                min: 1,
            },
            'followSymlink': {
                title: variousText.followSymbolicLinks,
                icon: webFonts.link,
                detail: variousText.followSymbolicLinksAbout,
                value: userSettings.followSymlink,
            },
            'keepRelativeSymlinks': {
                title: variousText.keepRelativeSymbolicLinks,
                icon: webFonts.link,
                detail: variousText.keepRelativeSymbolicLinksAbout,
                value: userSettings.keepRelativeSymlinks,
            },
            'useJunctionsForSymlinks': {
                title: variousText.useJunctionsForSymlinks,
                icon: webFonts.link,
                detail: variousText.useJunctionsForSymlinksAbout,
                value: userSettings.useJunctionsForSymlinks,
                platforms: ["win32"],
            },
            'useSystemIcons': {
                title: variousText.useSystemIcons,
                icon: webFonts.icons,
                detail: variousText.useSystemIconsAbout,
                value: userSettings.useSystemIcons,
            },
            'detectFileMoving': {
                title: variousText.detectFileMoving,
                icon: webFonts.dolly,
                detail: variousText.detectFileMovingAbout,
                value: userSettings.detectFileMoving,
            },
            'detectFileRenaming': {
                title: variousText.detectFileRenaming,
                icon: webFonts.keyboard,
                detail: variousText.detectFileRenamingAbout,
                value: userSettings.detectFileRenaming,
            },
            'detectFileRenamingWhileMoving': {
                title: variousText.detectFileRenamingWhileMoving,
                icon: webFonts.keyboard + webFonts.dolly,
                detail: variousText.detectFileRenamingWhileMovingAbout,
                value: userSettings.detectFileRenamingWhileMoving,
            },
        });
        dialog.setTitle(variousText.settings);

        var modal  = new BasicModal({
            width: 460,
            jqContent: dialog.getJQ(),
            icon: webFonts.cogSpin,
        });

        const settingsBegin = dialog.getSettings();
        modal.onCloseButton = ()=>{
            const settingsEnd = dialog.getSettings();

            // Jedno lub więcej ustawień się zmieniło od czasu otwarcia.
            if(_.isEqual(settingsBegin, settingsEnd) === false){
                // Dopisanie ustawień do danych użytkownika.
                _.assign(this.userdata.settings, settingsEnd);
                this._saveUserdata();
                // Odświerzenie ikon jeśli trzeba.
                this.ftransferTable.useWebfontsAsFileIcons(
                    !settingsEnd.useSystemIcons);
                // Poinformowanie o zmianach.
                this._onUserInput();
            }
            modal.close();
        }

        // Uruchomienie modala i skryptu.
        modal.open();
    }
    // Uruchamia okienko z informacjami o programie.
    _onOpenAbout(){
        // Konfiguracja modalu stanu przeglądania folderów.
        var jqAbout = $(
            `<div class="about-dialog">
                <div class="about-dialog-icon">${webFonts.AM}</div>
                <div class="about-dialog-author">${variousText.author}</div>
                <div class="about-dialog-author-name">Aron Mandrella</div>
                <div class="about-dialog-date">07.2019 <i class="fas fa-umbrella-beach"></i></div>
            </div>`
        );
        var modal  = new BasicModal({
            width: 250,
            jqContent: jqAbout,
            icon: webFonts.question,
        });

        modal.onCloseButton = ()=>modal.close();
        modal.open();
    }

    // --------------------- OBSŁUGA EVENTÓW:

    // Wywoływana przez menu kontekstowe w tabeli połączeń.
    // Pokazuje w abeli zawartość wybranego folderu.
    _onShowContents(path){
        this._walkFolder(path);
    }
    // Zmiana ustawień wpływajacych na synchronizację.
    _onUserInput(){
        if(this.currentSyncTasks !== null)
            this.syncTasksMayBeOutdated = true;
    }
    // Wywoływana przy kliknieciu ustawienia.
    _onAppbarSettings(jqClickedButton, jqButtons){
        this._openSettings();
    }
    // Wywoływana przy kliknieciu porównaj.
    _onAppbarCompare(jqClickedButton, jqButtons){    
        // Pobranie połączeń folderów z tabeli...
        const folderLinks = this.flinkTable.getFolderLinks();

         // ... jeśli wystąpił błąd w danych folderów...
        if(folderLinks === null)  return;

        // ... jeśli brak połączeń folderów.
        if(folderLinks.length === 0){
            dialog.showMessageBox(win, {
                type: "info",
                title: ' ',
                message: variousText.nothingToCompare,
                detail: variousText.linkTableIsEmptyOrNothingSelected
            });
            return;
        }

        // Porównanie folderów.
        this._compareFolders(folderLinks);
    }
    // Wywoływana przy kliknięciu synchronizuj.
    _onAppbarSync(jqClickedButton, jqButtons){
        // Jeśli dane w tabelach się zmieniły:
        if(this.syncTasksMayBeOutdated === true){
            var buttonID = dialog.showMessageBox(win, {
                type: "warning",
                buttons: [variousText.compareAgain, variousText.syncNevertheless],
                defaultId: 0, cancelId: 0,
                title: ' ' + variousText.warning,
                message: variousText.syncDataMayBeOutdated,
                detail: variousText.changesWereMade,
            });

            // Ponowne porównanie folderów.
            if(buttonID === 0){
                this.appbar.getButton('compare')[0].click();
                return;
            }
        }

        // Uruchomienie synchronizacji.
        this._syncFolders(this.currentSyncTasks);
    }
    // Informacje o programie.
    _onAppbarAbout(){
        this._onOpenAbout();
    }

    // --------------------- BUDOWANIE GUI:

    _createAppGUI(){
        this.jqApp = $(
            `<div class="mirror-disc-app"></div>`
        );

        // Przygotowanie titlebara.
        this.titlebar = new BasicTitlebar();
        this.titlebar.setTitlebarIcon(webFonts.database);
        this.titlebar.setTitlebarTitle('MirrorDisc');

        // Przygotowanie appbara.
        var appbarParams = [
            {
                key: 'compare',
                icon: webFonts.search,
                text: variousText.compareFolders,
                click: (...args)=>this._onAppbarCompare(...args),
                onenable: (jqButton)=>{ jqButton.attr('title', variousText.comparesFolders); },
                classes: '',
                attrs: '',
            },
            {
                key: 'sync',
                icon: webFonts.sync,
                text: variousText.synchronize,
                click: (...args)=>this._onAppbarSync(...args),
                enabled: false,
                onenable: (jqButton)=>{ jqButton.attr('title', variousText.syncsFolders); },
                ondisable: (jqButton)=>{ jqButton.attr('title', variousText.youNeedToCompareBeforeSync); },
                classes: '',
                attrs: '',
            },{
                key: 'about',
                icon: webFonts.idCard,
                text: variousText.about,
                click: (...args)=>this._onAppbarAbout(...args),
                onenable: (jqButton)=>{ jqButton.attr('title', variousText.about); },
                classes: '',
                attrs: '',
            },
            {
                key: 'settings',
                icon: webFonts.cog,
                text: variousText.settings,
                click: (...args)=>this._onAppbarSettings(...args),
                onenable: (jqButton)=>{ jqButton.attr('title', variousText.opensSettings); },
                classes: '',
                attrs: '',
            },
        ];
        this.appbar = new BasicAppbar(appbarParams);

        // Przygotowanie tabeli interfejsu.
        this.flinkTable = new FolderLinkTable();
        this.ftransferTable = new FileTransferTable();

        // Dołączenie modułów do GUI.
        this.jqApp.append(this.titlebar.getJQ());
        this.jqApp.append(this.appbar.getJQ());
        this.jqApp.append(this.flinkTable.getJQ());
        this.jqApp.append(this.ftransferTable.getJQ());

        // const test = new BasicTableSG();
        // this.jqApp.append(test.getJQ());

        // Dodanie interfejsu do GUI.
        setTimeout(()=>{
            $('body').append(this.jqApp);
        }, 0);
    }

    constructor(){
        this._createAppGUI();

        // Obsługa eventu user-input
        appEventEmitter.on('user-input', ()=>this._onUserInput());
        // Obsługa eventu show-contents
        appEventEmitter.on('show-contents', (path)=>this._onShowContents(path));

        // Nasłuchiwanie eventów okienka.
        this.eventHandlers = [
            ['focus', ()=>{
                // Gdy myszka jest poza oknem to jest szansa,
                // że zmieniono jakieś foldery.
                this.flinkTable.validateAll();}],
        ];
        for(const handlerData of this.eventHandlers)
            this.win.on(...handlerData);

        // Otwieranie: wczytanie danych.
        this._loadUserdata();

        // Zamykanie: zapisanie danych i sprzątanie.
        window.onbeforeunload = ()=>{
            this._saveUserdata();
            this.titlebar.clearEventHandlers();
            for(const handlerData of this.eventHandlers)
                this.win.off(...handlerData);
        };

        // Ustawienie napisu w titlebarze.
        this._updateTitlebar();

        // Ustawienie automatycznego odświerzania titlebara
        setInterval(()=>this._updateTitlebar(), 1000*60);
    }
}
var appEntryPoint = new MirrorDiscApp();