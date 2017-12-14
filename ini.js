'use strict';
window.addEventListener('load',function() {
	//Create memory and regsiters
	var stack = 2;
	var size = Math.pow(16,stack);
	var table = document.getElementById('cpu');
	var tbody = '';
	for (var i = 0; i < size; i++) {
		var hex = i.toString(16).toUpperCase();
		for (var j = hex.length; j < stack; j++) hex = '0' + hex;
		var newLine = '<td>R0' + hex + '</td><td><input id="R0' + hex + '" value="" class="memory_value" /></td>';
		newLine += '<td>M0' + hex + '</td><td><input id="ML' + hex + '" value="" class="label" /></td><td><input id="M0' + hex + '" value="" class="instruction" /></td>';
		newLine += '<td>M1' + hex + '</td><td><input id="M1' + hex + '" value="" class="memory_value" /></td>';
		newLine += '<td>M2' + hex + '</td><td><input id="M2' + hex + '" value="" class="memory_value" /></td>';
		newLine += '<td>M3' + hex + '</td><td><input id="M3' + hex + '" value="" class="memory_value" /></td>';
		tbody += '<tr>' + newLine + '</tr>';
	}
	table.innerHTML += tbody;
	//PC decimal
	document.getElementById('pc').addEventListener('change',function(){
		var hex = Number(this.value).toString(16).toUpperCase();
		for (var j = hex.length; j < 2; j++) hex = '0' + hex;
		document.getElementById('pcHex').innerHTML = 'PC(Hex): ' + hex;
	});
});
