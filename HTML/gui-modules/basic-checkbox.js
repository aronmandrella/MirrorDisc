"use strict";

//----------- Moduły NodeJs ------------//

const path = require('path');
const url  = require('url');
const $    = require('jquery');

//------------- Moduły gui -------------//

const gui  = require('./_gui-module');

//---------- Właściwa logika -----------//

gui.loadStylesheet(__dirname, 'basic-checkbox.css');

//-------------- Export -------------//
//..