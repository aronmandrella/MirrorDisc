"use strict";

//----------- Moduły NodeJs ------------//

const path      = require('path');
const url       = require('url');
const $         = require('jquery');

//---------- Właściwa logika -----------//

// Wczytuje plik stylu (CSS) poprzez dodanie odpowiedniego tagu do sekcji 'head'.
// Przed dodaniem sprawdza również czy taki tag już w sekcji head się nie znajduje.
const loadStylesheet = (...pathParts)=>{
    // Określenie ścieżki url do pliku.
    var file = path.resolve(...pathParts);
    var href = url.pathToFileURL(file).href;

    // Sprawdzenie czy ten plik nie został już zdefiniowany w tagu 'head'.
    var needsLoading = true;
    $('head link').each(function(){
        if(this.href === href) needsLoading = false; });

    // Dodanie stylu o ile nie został już dodany.
    if(needsLoading){
        $('head').append($(`<link rel="stylesheet" href="${href}">`));   
    }
}

function getEnvLocale(env) {
    env = env || process.env;

    return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

//-------------- Export -------------//

module.exports = {
    "loadStylesheet": loadStylesheet
}