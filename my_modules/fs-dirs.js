// ----------------------------------------- MODUŁY ------------------------------------------- //

// original-fs: bo Electron coś kombinuje z fs!
// Dla zwykłego fs pliki asar są traktowane, jak foldery co powoduje głupie błędy.
const fs            = require('original-fs');
const fsPromises    = fs.promises;

const fse           = require('fs-extra');
const moveFile      = require('move-file');
const cpFile        = require('cp-file');
const fc            = require('filecompare');
const path          = require('path');
const _             = require('lodash');

// ------------------------------------ FUNKCJE UTILITY -------------------------------------- //

// Na systemach które przy analizowaniu ścieżek nie uwzględniają rozmairu liter,
// zwróci tekst przekształcony na mały case.
const normalizePathCase = (path.relative('a', 'A').length === 0) ?
(p)=>{ return p.toLowerCase(); } : (p)=>{ return p; };


// Określa czy ścieżki nie są czułe na rozmiary znaków.
const CASE_INSENSITIVE_PATHS = (path.relative('a', 'A').length === 0);
// Wciąga z obiektu wartość relativePath na cele porównań. Jeśli zajdzie taka potrzeba,
// to zneutralizuje case dla porównań na systmie windows gdzie ścieżka 'aa' to ścieżka 'Aa'.
const byRelativePath = (CASE_INSENSITIVE_PATHS) ?
(obj)=>{ return obj.relativePath.toLowerCase(); } : (obj)=>{ return obj.relativePath; };
// Wciąga z obiektu wartość path.basename(obj.relativePath) na cele porównań. Jeśli zajdzie taka potrzeba,
// to zneutralizuje case dla porównań na systmie windows gdzie ścieżka 'aa' to ścieżka 'Aa'.
const byRelativePathBasename = (CASE_INSENSITIVE_PATHS) ?
(obj)=>{ return path.basename(obj.relativePath.toLowerCase()); } : (obj)=>{ return path.basename(obj.relativePath); };
// Wciąga z obiektu wartość path.dirname(obj.target.path) na cele porównań. Jeśli zajdzie taka potrzeba,
// to zneutralizuje case dla porównań na systmie windows gdzie ścieżka 'aa' to ścieżka 'Aa'.
const byRelativePathDirname = (CASE_INSENSITIVE_PATHS) ?
(obj)=>{ return path.dirname(obj.target.path.toLowerCase()); } : (obj)=>{ return path.dirname(obj.target.path); };

// --------------------------------- PRZEGLĄDANIE FOLDERÓW ----------------------------------- //

// Robi to co funkcja 'fs.readdir' ale rekurencyjnie tak by sprawdzić
// również wszyskie foldery wewnątrz wskazanego folderu. Ponad to zwraca
// nie tablicę a obiekt w którym zwrócone są ścierzki podzielone na cztery
// typy: foldery, pliki, połączenia symboliczne i ewentualne błędy, a
// wartości odbiera się jak promise nie po przez callback.
// Opcje: followSymlink i obiekt counter z polami: dir, file, link, error
// (można tych wartości użyć na zewnątrz do wyświetlania stanu odczytu.)
const readdirRecursive = function(dir, options = {}){
    return _readdirRecursive(dir, options, dir);
}
const _readdirRecursive = function(dir, options, rootDir) {
    // Parametry domyślne 1.
    _.defaults(options, {
        followSymlink: false,
    });

    // Parametry domyślne 2.
    const counter = _.defaultTo(options.counter, {});
    _.defaults(counter, {
        dir: 0,
        file: 0,
        link: 0,
        error: 0,
        bytes: 0,
    });

    return new Promise((resolve, reject)=>{            
        // Określenie funkcji do analizy plików.
        const fsstat = options.followSymlink ? fs.stat : fs.lstat;

        // Wyniki.
        var result  = {
            dir: [],
            file: [],
            link: [],
            error: [],
        };

        // Analizowanie plików wewnątrz folderu.
        fs.readdir(dir, function(err, list) {
            if (err){
                result.error.push(err); ++counter.error;
                return resolve(result);
            };

            // Określenie liczby plików do sprawdzenia.
            var pending = list.length;
            if (!pending) return resolve(result);

            // Sprawdzanie wszystkich plików.
            list.forEach(function(file) {
                file = path.join(dir, file);

                // Sprawdzenie czy nie zarządano abortu.
                if(options.abort === true) return resolve(null);

                // Pobieranie informacji o plikach.
                fsstat(file, function(err, stat) {
                    if (err){
                        result.error.push(err); ++counter.error;
                        if (!--pending) resolve(result);
                        return;
                    };

                    // Określenie typu:
                    var type;
                    if(stat.isDirectory())          type = 'dir';
                    else if(stat.isFile())          type = 'file';
                    else if(stat.isSymbolicLink())  type = 'link';
                    else return;

                    // Zapisanie potrzebnych danych:
                    var fileInfo = {
                        'type': type,
                        'stat': {
                            'path':  file,
                            'size':  stat.size,
                            'ctime': stat.ctimeMs,
                            'mtime': stat.mtimeMs,
                        },
                        'relativePath': path.relative(rootDir, file),
                    };
                    if(type === 'link'){
                        try {
                            var link = fs.readlinkSync(file);
                            fileInfo.stat.link = link;
                        } catch(err){
                            result.error.push(err); ++counter.error;
                            if (!--pending) resolve(result);
                            return;
                        }
                    }
                    result[type].push(fileInfo); ++counter[type]; counter.bytes += fileInfo.stat.size;

                    // Dalsza rekurencja tylko dla folderów:
                    if (type !== 'dir'){
                        if (!--pending) resolve(result);
                    }
                    else{
                        _readdirRecursive(file, options, rootDir).then(function(partial){
                            // Wystąpił abort.
                            if(partial === null) return resolve(null);

                            // Łączenie wyników.
                            Object.keys(result).forEach(
                                (key)=>result[key] = result[key].concat(partial[key]));
                            
                            if (!--pending) resolve(result);
                        });
                    }
                });
            });
        });
    });
};

// Konwertuje wyniki z readdir na tablicę plików.
const collapseReaddir = function (readdir){
    var array = [];
    array = array.concat(
        readdir.dir,
        readdir.file,
        readdir.link);
    return array;
}

// ------------------------------ WYZNACZANIE ZADAŃ SYNCHRONIZACJI -------------------------- //

// Porównuje bit po bicie zawartość dwóch plików.
// Resolve może zwrócić true lub false, a reject error.
function compareFiles(path1, path2){
    return new Promise((resolve, reject)=>{
        try {
            fc(path1, path2, (result)=>resolve(result));
        }
        catch(err) {
            reject(err);
        }
    });
}

// Na wejście nalerzy podać obiekt w którym będą pola: source i target,
// przy czym source musi mieć path i link, a target path. Na podstawie tego
// funkcja określi jakie powinno być nowe połączenie symboliczne dla target
// w zalerznośći od wartosci keepRelativeSymlinks.
const getTargetLink = function(o, keepRelativeSymlinks = true){
    if(keepRelativeSymlinks === false){
        return o.source.link;
    }
    else {
        var sourcePathParts = o.source.path.split(path.sep);
        var sourceLinkParts = o.source.link.split(path.sep);
        if(sourcePathParts[0] === sourceLinkParts[0]){
            // Połączenie symboliczne było w obrębie tego samego dysku,
            // i flaga keepRelativeSymlinks to true:
            var targetPathParts = o.target.path.split(path.sep);
            sourceLinkParts[0] = targetPathParts[0];
            return path.join(...sourceLinkParts);
        }
        else {
            return o.source.link;
        }
    }
}

// Porównuje podane ścieżki foderu źródłowego i folderów docelowych, i zwraca
// tablicę operacji jakie nalerzy wykonać dla każdego folderu docelowego by
// doprowadzić go do stanu folderu źródłowego.
const compareFoldersPaths = function(sourceDir, sourcePaths, targetDir, targetPaths, options = {}){
    return new Promise(async (resolve, reject)=>{
        // Ustawienia domyślne:
        // Określa czy wykrywać przemieszczanie pliku w obrębie folderu.
        const detectFileMoving = _.defaultTo(options.detectFileMoving, false);
        // Określa czy wykrywać zmiany nazw plików.
        const detectFileRenaming = _.defaultTo(options.detectFileRenaming, false);
        // Określa czy wykrywać zmiany nazw i przeniesienie jednocześnie.
        const detectFileRenamingWhileMoving = _.defaultTo(options.detectFileRenamingWhileMoving, false);
        // Czy zachowywywać relatywność połączeń symbolicznych w obrębie jednego dysku.
        const keepRelativeSymlinks = _.defaultTo(options.keepRelativeSymlinks, true);
        // O ile ms może się różnić mtime plików (przy tym samym size) by nie wykryć update-u.
        const mtimeChangeThreshold = _.defaultTo(options.mtimeChangeThreshold, 1);

  
        // Wyznacza obie strony intersekcji obiektów ścieżek dla wybranej funkcji.
        const getPathsIntersection = (sources, targets, byFunction, keepDuplicates = false)=>{
            var iTargets; var iSources;

            // Wyznaczenie części wspólnej.
            if(keepDuplicates === false){
                // Pobiera intersekcję ale bez duplikatów.
                iTargets = _.intersectionBy(targets, sources, byFunction);
                iSources = _.intersectionBy(sources, targets, byFunction);
            }
            else {
                // Zwraca intersekcję z duplikatami.
                // ( Sortowanie i użycie sortedIndexOf by poszukiwać binarnie mocno optymalizuje, ale to co jest
                // wyżej dla dużych folderów jest o jakieś 33% szybsze)
                const intersecting = _.intersectionBy(
                    targets, sources, byFunction).map((obj)=>{return byFunction(obj);}).sort();
                iTargets = targets.filter((obj)=>{ return _.sortedIndexOf(intersecting, byFunction(obj)) > -1; });
                iSources = sources.filter((obj)=>{ return _.sortedIndexOf(intersecting, byFunction(obj)) > -1; });
            }

            // Sortowanie wyników by te same nazwy były obok siebie.
            const sortByFunction = (objA, objB)=>{
                const a = byFunction(objA); const b = byFunction(objB);
                return (a < b) ? -1 : (a > b); };
            iTargets.sort(sortByFunction);
            iSources.sort(sortByFunction);

            return [iSources, iTargets];
        };
        // Sprawdza czy link dla target jest taki jaki powinien być biorąc pod uwagę source.
        const testLinks = (sourceStats, targetStats)=>{
            return path.relative(targetStats.link, getTargetLink(
                {source: sourceStats, target: targetStats}, keepRelativeSymlinks)).length === 0;
        };
        // Porównuje czas modyfikacji i rozmiar i zwraca czy dla obu plików były takie same.
        const testMtimeAndSize = (sourceStats, targetStats)=>{
                return !((Math.abs(sourceStats.mtime - targetStats.mtime) > mtimeChangeThreshold) ||
                    (sourceStats.size !== targetStats.size));
        };

        // Lista operacji do wykonania dla folderu i miejsce na błędy.
        const diffs = {}; diffs.error = [];

        // Zasadnicza część kodu.
        for(var key in targetPaths){
            // Sprawdzenie czy nie zarządano abortu.
            if(options.abort === true) return resolve(null);

            // Porównuje statystyki dwóch elementów by określić czy,
            // są powieszchownie takie same.
            const testIfStatsAreEqual = (key === 'link') ?
                testLinks : ((key === 'file') ? testMtimeAndSize : ()=>{ return true; });

            // Wybranie odpowiednich elementów do każdej kategorii.
            diffs[key] = {};

            // Wykrycie dodawań i usunięć na podstawie różnic ścieżek.
            diffs[key].add = _.cloneDeep(_.differenceBy(sourcePaths[key], targetPaths[key], byRelativePath));
            diffs[key].remove = _.differenceBy(targetPaths[key], sourcePaths[key], byRelativePath);
            
            // Wykrycie updateów na podstawie części współnych ścieżek.
            if(key !== 'dir') {
                diffs[key].update = [];

                // Przygotowanie posortowanych tablic przecięcia dla obu tablic plików.
                const intersections = getPathsIntersection(targetPaths[key], sourcePaths[key], byRelativePath);
                const iTargetPaths = intersections[0];
                const iSourcePaths = intersections[1];

                if(iTargetPaths.length !== iSourcePaths.length)
                    console.warn('DEBUG: WRONG LENGTHS!', iTargetPaths, iSourcePaths);

                for(let i = 0; i < iTargetPaths.length; i++){
                    const source = iSourcePaths[i];
                    const target = iTargetPaths[i];

                    if(byRelativePath(source) !== byRelativePath(target)){
                        console.warn('DEBUG: NOT EQUAL RELATIVE PATHS!', source.relativePath, target.relativePath);
                        continue;
                    }

                    // Porównanie linków lub czasu i rozmiaru i określenie czy aktualizować.
                    if(testIfStatsAreEqual(source.stat, target.stat) === false){
                        target.source = source.stat;
                        diffs[key].update.push(target);
                    }
                }
            }
            else{
                diffs[key].update = [];
            }

            // Sprzątanie danych w obiektach (określanie linków i co jest czym).
            diffs[key].remove.forEach((o)=>{
                o.fun = 'remove';
                Object.defineProperty(o, 'target',
                    Object.getOwnPropertyDescriptor(o, 'stat'));
            });
            diffs[key].add.forEach((o)=>{
                o.fun = 'add'; 
                Object.defineProperty(o, 'source',
                    Object.getOwnPropertyDescriptor(o, 'stat'));
                o.target = {'path': path.join(targetDir, o.relativePath)};
                if(key === 'link'){
                    o.target.link = getTargetLink(o, keepRelativeSymlinks);
                }
            });
            diffs[key].update.forEach((o)=>{
                o.fun = 'update';
                Object.defineProperty(o, 'target',
                    Object.getOwnPropertyDescriptor(o, 'stat'));
                if(key === 'link'){
                    o.target.link = getTargetLink(o, keepRelativeSymlinks);
                }
            });

            // Wykrycie przemieszczeń na podstawie uptdatów, usunieć i dodawań.
            if(detectFileMoving && key !== 'dir'){
                diffs[key].move = [];

                const intersections = getPathsIntersection(
                    diffs[key].remove.concat(key !== 'dir' ? diffs[key].update : []),
                    diffs[key].add.concat(key !== 'dir' ? diffs[key].update : []),
                    byRelativePathBasename, true);
                const iRemovedGroups = _.groupBy(intersections[0], byRelativePathBasename);
                const iAddedGroups   = _.groupBy(intersections[1], byRelativePathBasename);

                if(iRemovedGroups.length !== iAddedGroups.length)
                    console.warn('DEBUG: WRONG LENGTHS!', iRemovedGroups, iAddedGroups);

                // Wykrywanie przesunięc dla wszystkich potencialnych nazw plików.
                for(const basename in iAddedGroups){
                    const iRemoved = iRemovedGroups[basename];
                    const iAdded   = iAddedGroups[basename];
                    const onlyOne  = iRemoved.length === 1 && iAdded.length === 1;

                    for(let i = 0; i < iRemoved.length; i++){
                        const removed = iRemoved[i];
                        for(const added of iAdded){
                            // Sprawdzenie czy można uznać że plik jest przenoszony:
                            // A. Powieszchowne porównanie plików i połączeń...
                            var condition = testIfStatsAreEqual(removed.target, added.source);
                            if(!onlyOne && condition === true && key === 'file'){
                                // B. Dokładne porównanie plików po zawartości jeśli jest kilka o tej samej nazwie,
                                // i konieczne jest rozszczygnięcie sporu:
                                try{ condition = await compareFiles(removed.target.path, added.source.path); }
                                catch(err){
                                    diffs.error.push(err);
                                    condition = false;
                                }
                            }
                            if(condition){
                                // Przygotowania zadania przenoszenia.
                                const moved = {
                                    fun: 'move',
                                    type: key,
                                    source: removed.target,
                                    target: { path: added.target.path }
                                };
                                diffs[key].move.push(moved);
                                if(key === 'link'){
                                    moved.target.link = added.target.link;
                                }

                                // Przetworzenie składowych zadania przenoszenia.
                                if(added.fun === 'update'){
                                    _.pull(iAdded, added); // <-- By znowu nie sprawdzać wykorzystanego.
                                    _.pull(diffs[key].update, added);
                                    // ...ale update da się rozbić, więc zostaje jeszcze remove.
                                    added.fun = 'remove';
                                    delete added.source;
                                    diffs[key].remove.push(added);
                                    iRemoved.push(added);
                                }
                                else{
                                    _.pull(iAdded, added); // <-- By znowu nie sprawdzać wykorzystanego.
                                    _.pull(diffs[key].add, added);
                                }
                                if(removed.fun === 'update'){
                                    _.pull(diffs[key].update, removed);
                                    // ...ale update da się rozbić, więc zostaje jeszcze add.
                                    removed.fun = 'add';
                                    removed.target = {path: removed.target.path };
                                    diffs[key].add.push(removed);
                                    iAdded.push(removed);
                                }
                                else{
                                    _.pull(diffs[key].remove, removed);
                                }
                            }
                        }
                    }
                }
            }
            else {
                diffs[key].move = [];
            }

            // Wykrywanie zmian nazwy na podstawie usunięć i dodawań.
            if(detectFileRenaming && key !== 'dir'){
                diffs[key].rename = [];

                // Do porównywania obiektów w oparciu o wartość rozmiaruw bajtach.
                const byStatSize = (obj)=>{ return obj.stat.size; };
                // Poszukiwanie plików o zmienionej nazwie wewnątrz oryginalnego folderu jest bezpieczniejsze,
                // więc dobrze dać możliwość wyboru której opcji używać. Jeśli plik może się przenieść to
                // grupowanie będzie po rozmiarze, jeśli nie może to po ścieżce folderu rodzica.
                const byFunction = detectFileRenamingWhileMoving ? byStatSize : byRelativePathDirname;

                const intersections = getPathsIntersection(
                    diffs[key].remove, diffs[key].add,
                    byFunction, true);
                const iRemovedGroups = _.groupBy(intersections[0], byFunction);
                const iAddedGroups   = _.groupBy(intersections[1], byFunction);

                if(iRemovedGroups.length !== iAddedGroups.length)
                    console.warn('DEBUG: WRONG LENGTHS!', iRemovedGroups, iAddedGroups);

                // Wykrywanie zmian nazwy dla wszystkich plików o wspólnym rozmairze.
                for(const fileSize in iAddedGroups){
                    const iRemoved = iRemovedGroups[fileSize];
                    const iAdded   = iAddedGroups[fileSize];
                    const onlyOne  = iRemoved.length === 1 && iAdded.length === 1;

                    for(let i = 0; i < iRemoved.length; i++){
                        const removed = iRemoved[i];
                        for(const added of iAdded){
                            // Sprawdzenie czy można uznać że plik miał zmienioną nazwę.
                            // A. Powieszchowne porównanie plików i połączeń...
                            var condition = testIfStatsAreEqual(removed.target, added.source);
                            if(!onlyOne && condition === true && key === 'file'){
                                // B. Dokładne porównanie plików po zawartości jeśli jest kilka o tym samym rozmiarze.
                                try{ condition = await compareFiles(removed.target.path, added.source.path); }
                                catch(err){
                                    diffs.error.push(err);
                                    condition = false;
                                }
                            }
                            if(condition){
                                // Przygotowania zadania zmiany nazwy.
                                const renamed = {
                                    fun: 'rename',
                                    type: key,
                                    source: removed.target,
                                    target: { path: added.target.path }
                                };
                                diffs[key].rename.push(renamed);
                                if(key === 'link'){
                                    renamed.target.link = added.target.link;
                                }
                                // Usunięcie skłądowych zadań z list...
                                _.pull(diffs[key].add, added);
                                _.pull(diffs[key].remove, removed);
                                // ... i z listy poszukiwań.
                                _.pull(iAdded, added);
                            }
                        }
                    }
                }
                
            }
            else{
                diffs[key].rename = [];
            }

            // Dodatkowe sprzątenie w obiektach (stat i relativePath są już zbędne).
            diffs[key].add.forEach((o)=>{ delete o['stat']; delete o['relativePath']; });
            diffs[key].remove.forEach((o)=>{ delete o['stat']; delete o['relativePath']; });
            diffs[key].update.forEach((o)=>{ delete o['stat']; delete o['relativePath']; });
        }
        
        return resolve(diffs);
    });
}

// Sprowadza listę zadań z podziałem na typ i funkcję do ostatecznej tablicy zadań
// według tego w jakiej kolejności te operacje nalerzy wykonać.
const collapseSynchronizationTasks = function(_tasks){
    var tasks = [];
    tasks = tasks.concat(        
        _tasks.file.remove,
        _tasks.link.remove,
        _tasks.dir.remove,

        _tasks.dir.add,

        _tasks.file.update,
        _tasks.link.update,
        _tasks.file.add,
        _tasks.link.add,
    );
    return tasks;
}

// Analizuje podane w dirs foldery względem referenceDir i zwraca tablicę mającą
// taki wymiar jak dirs w której jest określone co nalerzy by dany folder dir
// doprowadzić do takiego stanu jak folder referenceDir. Dodatkowo drugi zwracany
// argument w resolve to tablica wszystkich błędów jakie miały miejsce przy
// analizowania plików i folderów. UWAGA: na windows ścieżki będą porównywane
// z pominięciem rozmiaru znaków.
const getFolderSynchronizationTasks = function(syncDataArray = [], options = {}){
    // TODO UWAGA:
    // Trzeba by tu jeszcze sprawdzić czy scieżka istnieje,
    // ale reszta programu to sprawdza a już mi się nie chce...

    // Walidacja, sprawdzenie formatów i poprawności danych:
    var targetFoldersCount = 0;
    if(!Array.isArray(syncDataArray)) { syncDataArray = [syncDataArray]; }  
    for(const syncData of syncDataArray){
        if(syncData.source === undefined)
            throw Error("One or more source is undefined.");
        if(syncData.targets === undefined)
            throw Error("One or more targets is undefined.");

        if(!Array.isArray(syncData.targets)) { syncData.targets = [syncData.targets]; }  

        if(!path.isAbsolute(syncData.source))
            throw Error("One or more source wasn't absolute.");
    
        for(const target of syncData.targets){
            ++targetFoldersCount;
            if(!path.isAbsolute(target))
                throw Error("One or more target wasn't absolute.");
        }
    }

    // Ustawienia domyślne
    const counter = _.defaultTo(options.counter, {});
    _.defaults(counter, {
        readdirCurrent: '',
        readdirDone: 0,
        compareProgress: 0,
        compareProgressMax: targetFoldersCount,
    });

    // Zasadnicza część:
    return new Promise(async (resolve, reject)=>{
        // Tablice na wszystkie błędy i wszystkie zadania.
        var errors = [];  var tasks = [];

        // Wyznaczanie zadań.
        for(const syncData of syncDataArray){
            // Przebadanie folderu źródłowego.
            const sourceDir   = syncData.source;
            counter.readdirCurrent = sourceDir;
            const sourcePaths = await readdirRecursive(sourceDir, options);
            if(sourcePaths === null) return reject('abort');
            ++counter.readdirDone;
            
            // Przeniesienie błędów.
            errors = errors.concat(sourcePaths.error); delete sourcePaths.error;

            for(const targetDir of syncData.targets){
                // Przebadanie folderu docelowego.
                counter.readdirCurrent = targetDir;
                const targetPaths = await readdirRecursive(targetDir, options);
                if(targetPaths === null) return reject('abort');
                ++counter.readdirDone;

                // Przeniesienie błędów.
                errors = errors.concat(targetPaths.error); delete targetPaths.error;

                // Porównanie folderów.
                const partialTasks = await compareFoldersPaths(
                    sourceDir, sourcePaths, targetDir, targetPaths, options);
                if(partialTasks === null) return reject('abort');
                ++counter.compareProgress;
            
                // Przeniesienie błędów.
                errors = errors.concat(partialTasks.error); delete partialTasks.error;

                // Dopisanie zadań do wszystkich zadań.
                for(let type in partialTasks){
                    if(tasks[type] === undefined) tasks[type] = {};
                    for(let fun in partialTasks[type]){
                        if(tasks[type][fun] === undefined) tasks[type][fun] = [];
                        tasks[type][fun] = tasks[type][fun].concat(partialTasks[type][fun]);
                    }
                }
            }
        }

        // Zwrócenie wyników.
        resolve({"tasks": tasks, "errors": errors});   
    });
}

// ------------------------------ SYNCHRONIZACJA FOLDERÓW ------------------------------ //

// Wykonuje zadania synchronizacji zwracane przez getFolderSynchronizationTasks w celu
// doprowadzenia porównywanych folderów do takiego samego stanu.
const doSynchronizationTasks = function(syncTasks = {}, options = {}){
    // Ustawienia domyślne 1:
    _.defaults(options, {
        useJunctionsForSymlinks: false,
    });

    // Ustawienia domyślne 2:
    const counter = _.defaultTo(options.counter, {});
    _.defaults(counter, {
        copy: {
            current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
            total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
        },
        move: {
            current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
            total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
        },
        remove: {
            current: { name: '', size: 0, sizeMax: 0, error: false, done: false, },
            total: { count: 0, countMax: 0, size: 0, sizeMax: 0, },
        },
        errors: 0,
    });

    //--------------- FUNKCJE UTILITY:

    // Tworzy dla danego zlecenia połączenie symboliczne. Ta funkcja głównie istnieje
    // ze względu na windows i to że automatyczne wykrywanie typu nie działa i połączenia
    // node zawsze tworzy jako 'file'. Dodatkowo bierze pod uwagę to czy nie ma flagi by
    // tworzycz junctions zamiast połączeń symbolicznych.
    const symlink = async (task)=>{
        // Określenie typu połączenia symbolicznego dla WINDOWS.
        var symlinkType = 'file';
        if(options.useJunctionsForSymlinks === true) {
            // Jeśli jawnie zarządano typu 'junction':
            symlinkType = 'junction';
        } else {
            try {
                // ...jeśli plik docelowy źródła istnieje i jest folderem:
                var stat = await fsPromises.stat(task.source.link);
                if(stat.isDirectory()) symlinkType = 'dir';
            }catch(err){ /* ...zostaje 'file' */ }
        }

        // Faktyczne tworzenie połączenia symbolicznego:
        await fsPromises.symlink(task.target.link, task.target.path, symlinkType);
    }
    // Kopiuje jeden plik z source do target, robi poprawkę na pliki .asar
    // (zmienia na czas kopiowania nazwę bo inaczej są widoczne jako foldery).
    // Dodatkowo do kopiowania są używane zamiennie dwie funkcje. Dla plików mniejszych
    // niż 50mb zwykłe coptFile z fs (szybkiem ukrywa niewidoczne pliki, dobrze oddaje mtime itd),
    // a dla większych cpFile z cp-file bo wspiera informowanie o przebiegu kopiowania.
    const copyFile = async (source, target, size, progressHandler)=>{
        if(path.extname(source) === '.asar'){
            await fsPromises.rename(source, source + '_');

            if(size < 50e6)
                await fsPromises.copyFile(source + '_', target + '_');
            else
                await cpFile(source + '_', target + '_').on('progress', progressHandler);
                
            await fsPromises.copyFile(source + '_', target + '_');
            await fsPromises.rename(source + '_', source);
            await fsPromises.rename(target + '_', target);
        }
        else{
            if(size < 50e6)
                await fsPromises.copyFile(source, target);
            else
                await cpFile(source, target).on('progress', progressHandler); 
        }
    };
    // Wyznacza sumę wszystkich elementów target.
    const sumTargetSize = (tasks)=>{
        return tasks.reduce(function(sum, obj) {
            return sum + obj.target.size;
        }, 0);
    };
    // Wyznacza sumę wszystkich elementów source.
    const sumSourceSize = (tasks)=>{
        return tasks.reduce(function(sum, obj) {
            return sum + obj.source.size;
        }, 0);
    };
    // Sortuje zadania po target.path.
    const sortByTargetPath = (a,b)=>{
        return (a.target.path < b.target.path) ?
         -1 : (a.target.path > b.target.path);
    }
    // Inicializacja statystyk w obiekcie counter.
    const initCounters = ()=>{
        // A. Suma bajtów wszystkich plików do skopiowania.
        counter.copy.total.sizeMax += sumSourceSize(syncTasks.file.add);
        counter.copy.total.sizeMax += sumSourceSize(syncTasks.file.update);
        // B. Suma bajtów wszystkich plików do usunięcia.
        counter.remove.total.sizeMax += sumTargetSize(syncTasks.file.remove);
        counter.remove.total.sizeMax += sumTargetSize(syncTasks.file.update);
        // C. Suma bajtów wszystkich plików do przeniesienia.
        counter.move.total.sizeMax += sumSourceSize(syncTasks.file.move);
        counter.move.total.sizeMax += sumSourceSize(syncTasks.file.rename);

        // D. Liczba wszystkich elementów do skopiowania.
        counter.copy.total.countMax += syncTasks.file.add.length;
        counter.copy.total.countMax += syncTasks.file.update.length;
        counter.copy.total.countMax += syncTasks.link.add.length;
        counter.copy.total.countMax += syncTasks.link.update.length;
        counter.copy.total.countMax += syncTasks.dir.add.length;
        // E. Liczba wszystkich elementów do usunięcia.
        counter.remove.total.countMax += syncTasks.file.remove.length;
        counter.remove.total.countMax += syncTasks.file.update.length;
        counter.remove.total.countMax += syncTasks.link.remove.length;
        counter.remove.total.countMax += syncTasks.link.update.length;
        counter.remove.total.countMax += syncTasks.dir.remove.length;
        // F. Liczba wszystkich elementów do przeniesienia.
        counter.move.total.countMax += syncTasks.file.move.length;
        counter.move.total.countMax += syncTasks.link.move.length;
        counter.move.total.countMax += syncTasks.file.rename.length;
        counter.move.total.countMax += syncTasks.link.rename.length;

        counter.initialized = true;
    }

    //--------------- INICIALIZACJA:

    // Inicializacja counterów:
    initCounters();
    // Tablica do zbierania wszystkich błędów:
    const errors = [];

    //--------------- FUNKCJE AKTUALIZACJI COUNTERÓW:

    // Zmienne pomocnicze.
    var funCounter = null;

    // Początek operacji.
    const onBegin = (fun, data)=>{
        // Wybranie odpowiedniego licznika.
        funCounter = counter[fun];
        // Zapisanie informacji o obecej operacji:
        funCounter.current.name    = path.basename(data.path);
        funCounter.current.size    = 0;
        funCounter.current.sizeMax = data.size;
        funCounter.current.error   = false;
        funCounter.current.done    = false;
        // Zachowanie początkowego rozmiaru sumarycznego licznika:
        funCounter.total._sizeBeg  = funCounter.total.size;
    }
    // Postęp operacji.
    const onProgress = (data)=>{
        funCounter.current.size = data.written;
        funCounter.total.size   = funCounter.total._sizeBeg + data.written;
    }
    // Zakończenie operacji.
    const onEnd = ()=>{
        // Zatwierdzenie w liczniku końca danej operacji.
        funCounter.current.done = true;
        funCounter.current.size = funCounter.current.sizeMax;
        // Zaktualizowanie kumulatywnych pól licznika:
        funCounter.total.size   = funCounter.total._sizeBeg + funCounter.current.sizeMax;
        funCounter.total.count += 1;
    }
    // Zakończenie operacji błędem.
    const onError = (error)=>{
        // Zatwierdzenie w liczniku błędu danej operacji.
        funCounter.current.error = true; counter.errors += 1;
        // Dodanie błędu do tablicy.
        errors.push(error);
    }

    //--------------- FUNKCJE PRZETWARZANIA PLIKÓW:

    // Sprawdza czy plik lub lokalizacja istnieje.
    const exists = async (path)=>{
        try{
            await fsPromises.access(path, fs.constants.F_OK);
            return true;
        }catch(err){
            return false;
        }
    };
    // Usuwa wszystkie pliki (pole target) w podanych taskach.
    const removeFiles = async (tasks)=>{
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('remove', task.target);
                await fsPromises.unlink(task.target.path);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Usuwa wszystkie foldery (pole target) w podanych taskach (idąc w górę).
    const removeDirs = async (tasks)=>{
        tasks.sort(sortByTargetPath).reverse();
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('remove', task.target);
                await fsPromises.rmdir(task.target.path);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Dodaje wszystkie foldery (pole target) w podanych taskach (idąc w dół).
    const makeDirs = async (tasks)=>{
        tasks.sort(sortByTargetPath);
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('copy', task.source);
                await fsPromises.mkdir(task.target.path);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Update-uje wszystkie pliki (source -> target) w podanych taskach.
    const updateFiles = async (tasks)=>{
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('remove', task.target);
                await fsPromises.unlink(task.target.path);
                onEnd();
                onBegin('copy', task.source);
                await copyFile(task.source.path, task.target.path, task.source.size, onProgress);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Kopiuje wszystkie pliki (source -> target) w podanych taskach.
    const copyFiles = async (tasks)=>{
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('copy', task.source);
                await copyFile(task.source.path, task.target.path, task.source.size, onProgress);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Przenosi wszystkie pliki (source -> target) w podanych taskach.
    const moveFiles = async (tasks)=>{
        const tempNamedTasks = [];
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                if(await exists(task.target.path)){
                    // Plik docelowy istnieje, koniecnza jest nazwa tymczasowa.
                    onBegin('move', task.source);
                    task.target.tempPath = task.target.tempPath + '_tempPath_' + tempNamedTasks.length;
                    await fsPromises.rename(task.source.path, task.target.tempPath);
                    tempNamedTasks.push(task);
                }
                else {
                    onBegin('move', task.source);
                    await fsPromises.rename(task.source.path, task.target.path);
                    onEnd();
                }
            }
            catch(err){ console.log(err); onError(err); }  
        }
        // Przywrócenie oryginalnych nazw plików.
        for(const task of tempNamedTasks){
            if(options.abort === true) return;
            try { 
                onBegin('move', task.source);
                await fsPromises.rename(task.target.tempPath, task.target.path);
                onEnd();
            }
            catch(err){ console.log(err); onError(err); }  
        }
    };
    // Update-uje wszystkie połączenia symboliczne (target.path, target.link) w podanych taskach.
    const updateSymlinks = async (tasks)=>{
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('remove', task.target);
                await fsPromises.unlink(task.target.path);
                onEnd();
                onBegin('copy', task.source);
                await symlink(task);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};
    // Dodaje nowe połączenia symboliczne (target.path, target.link) w podanych taskach.
    const makeSymlinks = async (tasks)=>{
        for(const task of tasks){
            if(options.abort === true) return;
            try { 
                onBegin('copy', task.source);
                await symlink(task);
                onEnd();
            }
            catch(err){ onError(err); }  
    }};

    //--------------- ZASADNICZA CZĘŚĆ:

    return new Promise(async (resolve, reject)=>{
        // CZ.1: Usuwanie plików i połączeń.
        await removeFiles(syncTasks.file.remove);
        await removeFiles(syncTasks.link.remove);

        // CZ.2: Dodanie nowych folderów.
        await makeDirs(syncTasks.dir.add);

        // CZ.3: Przenoszenie plików.
        await moveFiles(_.concat(
            syncTasks.file.move,
            syncTasks.link.move,
            syncTasks.file.rename,
            syncTasks.link.rename,
        ));

        // CZ.4: Update, przenoszenie i kopiowanie plików.
        await updateFiles(syncTasks.file.update);
        await copyFiles(syncTasks.file.add);

        // CZ.5: Update, przenoszenie i twrozenie połączeń symbolicznych.
        await updateSymlinks(syncTasks.link.update);
        await makeSymlinks(syncTasks.link.add);

        // CZ.6: Usunięcie zbędnych folderów.
        await removeDirs(syncTasks.dir.remove);

        // Zwrócenie wyników...
        if(options.abort === true)
            reject('abort');
        else
            resolve({"errors": errors});
    });
}

// ---------------------------------- EXPORT FUNKCJI ----------------------------------- //

// Export readdirRecursive i readdirRecursive_Array
// 2 argumenty: dir, options{followSymlink, counter}
module.exports.readDir = readdirRecursive

// Export getFolderSynchronizationTasks
// 3 argumenty: referenceDir, dirs, followSymlink
module.exports.getSyncTasks = getFolderSynchronizationTasks;

module.exports.doSyncTasks = doSynchronizationTasks;