//-------------- ROZSZERZENIA TYPU TABLICY ----------------//

// (UWAGA: jeśli oba porównywane elementy w tablicy to obiekty
// to usunięcie/wykrycie nastąpi tylko gdy wewnętrzne
// referencje będą wskazywać na ten sam adres
// w pamięci)

// Ostrzeżenie przed nadpisaniem.
if(Array.prototype.equals)
	{ console.warn("Overriding existing Array.prototype.equals."); }
if(Array.prototype.remove)
	{ console.warn("Overriding existing Array.prototype.remove."); }
if(Array.prototype.contains)
	{ console.warn("Overriding existing Array.prototype.contains."); }
	
// Dodanie do prototypu.
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length !== array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] !== array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Usuwa wszystkie elementy o wskazanej wartości.
Array.prototype.remove = function(value){
	var count = 0;
	for( var i = 0; i < this.length; i++){ 
		if ( this[i] === value) {
			this.splice(i, 1); 
			i--;
			count++;
		}
	 }
	 return count;
}
// Sprawdza czy dany element jest w tablicy.
Array.prototype.contains = function(value){
	for( var i = 0; i < this.length; i++){
		if ( this[i] === value) {
			return true;
		}
 }
 return false;
}

// Ukrycie w pętlach for...in.
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
Object.defineProperty(Array.prototype, "remove", {enumerable: false});
Object.defineProperty(Array.prototype, "contains", {enumerable: false});
