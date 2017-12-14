'use strict';
window.alu = new function() {
	//FLAGS
	this.flag = new Array();
	this.flag.run = false;
	//Set to run the program
	this.run = function() {
		this.flag.run = true;
		this.step(true);
	};
	//Set to stop the program
	this.stop = function() {
		this.flag.run = false;
	};
	//Execute a step
	this.step = function(keep) {
		//Execute current step
		var pc = document.getElementById('pc').value;
		var pcHex = Number(pc).toString(16).toUpperCase();
		for (var j = pcHex.length; j < 2; j++) pcHex = '0' + pcHex;
		document.getElementById('pcInd').innerHTML = '#ML' + pcHex + ',#M0' + pcHex + ' {background-color:#80FFCC;}';
		if (/\D/.test(pc)) {
			document.getElementById('status').innerHTML = 'PC has to be an int.';
			return;
		}
		if (pc > 255) {
			document.getElementById('status').innerHTML = 'PC overflow.';
			return;
		}
		this.execute();
		//Check flag
		if (!keep) return; //Return if run step
		if (!this.flag.run) {
			document.getElementById('status').innerHTML = 'Program halted.';
			return;
		}
		//Continue on
		setTimeout(function(){
			window.alu.step(true);
		},document.getElementById('speed').value);
	};
	this.execute = function() {
		//Reset status
		document.getElementById('status').innerHTML = '';
		//Get PC
		var hex = Number(document.getElementById('pc').value).toString(16).toUpperCase();
		for (var j = hex.length; j < 2; j++) hex = '0' + hex;
		var ins = document.getElementById('M0'+hex).value.toUpperCase();
		console.log('Ins #'+hex+'; Ins: '+ins);
		//Fetch Instruction
		switch(ins.substr(0,3)) {
			//DATA TRANSFER
			//Move register to register
			case 'MRR':
				//Check syntax
				var x = ins.match(/^MRR (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'MRR: Syntax error.';
					return;
				}
				//Check source
				if (!this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'MRR: Source register address error.';
					return;
				}
				var source = document.getElementById(x[2]).value;
				if (!this.check(source,'d')) {
					document.getElementById('status').innerHTML = 'MRR: Source data error.';
					return;
				}
				//Check destination
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'MRR: Destination register error.';
					return;
				}
				//Execute
				document.getElementById(x[1]).value = document.getElementById(x[2]).value;
				break;
			//Move immediate to register
			case 'MVI':
				//Check syntax
				var x = ins.match(/^MVI (R[0-9A-F]{3})\, \#([0-9A-F]{4})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'MVI: Syntax error.';
					return;
				}
				//Check input
				if (!this.check(x[2],'d')) {
					document.getElementById('status').innerHTML = 'MRR: Source data error.';
					return;
				}
				//Check destination
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'MRR: Destination register error.';
					return;
				}
				//Execute
				document.getElementById(x[1]).value = x[2];
				break;
			//Load from memory to register
			case 'LDM':
				//Check syntax
				var x = ins.match(/^LDMR (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'LDMR: Syntax error.';
					return;
				}
				//Check pointer address
				if (!this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'LDMR: Source register error.';
					return;
				}
				//Check source
				var pointer = 'M' + document.getElementById(x[2]).value.substr(-3);
				if (!this.check(pointer,'m')) {
					document.getElementById('status').innerHTML = 'LDMR: Source pointer error.';
					return;
				}
				var source = document.getElementById(pointer).value;
				if (!this.check(source,'d')) {
					document.getElementById('status').innerHTML = 'LDMR: Source data error.';
					return;
				}
				//Check destination
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'LDMR: Destination register error.';
					return;
				}
				//Execute
				document.getElementById(x[1]).value = source;
				break;
			//Store register to memory
			case 'STR':
				//Check syntax
				var x = ins.match(/^STRM (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'STRM: Syntax error.';
					return;
				}
				//Check source
				if (!this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'STRM: Destination register error.';
					return;
				}
				var source = document.getElementById(x[2]).value;
				if (!this.check(source,'d')) {
					document.getElementById('status').innerHTML = 'STRM: Source data error.';
					return;
				}
				//Check pointer address
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'STRM: Destination register error.';
					return;
				}
				//Check destination
				var pointer = 'M' + document.getElementById(x[1]).value.substr(-3);
				if (!this.check(pointer,'m')) {
					document.getElementById('status').innerHTML = 'STRM: Destination pointer error.';
					return;
				}
				//Execute
				document.getElementById('M'+document.getElementById(x[1]).value.substr(-3)).value = source;
				break;
			//MATH AND LOGIC
			//Add two registers
			case 'ADD':
				//Check syntax
				var x = ins.match(/^ADD (R[0-9A-F]{3})\, (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'ADD: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r') || !this.check(x[3],'r')) {
					document.getElementById('status').innerHTML = 'ADD: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				var c2 = document.getElementById(x[3]).value;
				if (!this.check(c1,'d') || !this.check(c2,'d')) {
					document.getElementById('status').innerHTML = 'ADD: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) + parseInt(c2,16);
				while(anw > 65535) {
					anw -= 65536;
					document.getElementById('status').innerHTML = 'ADD: Notice: Overflow detected.';
				}
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Add two registers
			case 'SUB':
				//Check syntax
				var x = ins.match(/^SUB (R[0-9A-F]{3})\, (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'SUB: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r') || !this.check(x[3],'r')) {
					document.getElementById('status').innerHTML = 'SUB: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				var c2 = document.getElementById(x[3]).value;
				if (!this.check(c1,'d') || !this.check(c2,'d')) {
					document.getElementById('status').innerHTML = 'SUB: Source data error.';
					return;
				}
				//Calc
				var anw =  parseInt(c1,16) - parseInt(c2,16);
				while(anw < 0) {
					anw += 65536;
					document.getElementById('status').innerHTML = 'SUB: Notice: Overflow detected.';
				}
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Increment register
			case 'INC':
				//Check syntax
				var x = ins.match(/^INC (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'INC: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'INC: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				if (!this.check(c1,'d')) {
					document.getElementById('status').innerHTML = 'INC: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) + 1;
				while(anw > 65535) {
					anw -= 65536;
					document.getElementById('status').innerHTML = 'INC: Notice: Overflow detected.';
				}
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Decrement register
			case 'DEC':
				//Check syntax
				var x = ins.match(/^DEC (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'DEC: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'DEC: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				if (!this.check(c1,'d')) {
					document.getElementById('status').innerHTML = 'DEC: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) - 1;
				while(anw < 0) {
					anw += 65536;
					document.getElementById('status').innerHTML = 'DEC: Notice: Overflow detected.';
				}
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Logical AND
			case 'AND':
				//Check syntax
				var x = ins.match(/^AND (R[0-9A-F]{3})\, (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'AND: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r') || !this.check(x[3],'r')) {
					document.getElementById('status').innerHTML = 'AND: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				var c2 = document.getElementById(x[3]).value;
				if (!this.check(c1,'d') || !this.check(c2,'d')) {
					document.getElementById('status').innerHTML = 'AND: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) & parseInt(c2,16);
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Logical OR
			case 'OR ':
				//Check syntax
				var x = ins.match(/^OR (R[0-9A-F]{3})\, (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'OR: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r') || !this.check(x[3],'r')) {
					document.getElementById('status').innerHTML = 'OR: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				var c2 = document.getElementById(x[3]).value;
				if (!this.check(c1,'d') || !this.check(c2,'d')) {
					document.getElementById('status').innerHTML = 'OR: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) | parseInt(c2,16);
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Logical XOR
			case 'XOR':
				//Check syntax
				var x = ins.match(/^XOR (R[0-9A-F]{3})\, (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'XOR: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r') || !this.check(x[3],'r')) {
					document.getElementById('status').innerHTML = 'XOR: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				var c2 = document.getElementById(x[3]).value;
				if (!this.check(c1,'d') || !this.check(c2,'d')) {
					document.getElementById('status').innerHTML = 'AND: Source data error.';
					return;
				}
				//Calc
				var anw = parseInt(c1,16) ^ parseInt(c2,16);
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//Logical NOT
			case 'NOT':
				//Check syntax
				var x = ins.match(/^NOT (R[0-9A-F]{3})\, (R[0-9A-F]{3})$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'NOT: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r') || !this.check(x[2],'r')) {
					document.getElementById('status').innerHTML = 'NOT: Register(s) error.';
					return;
				}
				//Get value
				var c1 = document.getElementById(x[2]).value;
				if (!this.check(c1,'d')) {
					document.getElementById('status').innerHTML = 'NOT: Source data error.';
					return;
				}
				//Calc
				var anw = ~parseInt(c1,16);
				while(anw < 0) { //JS using 64-bit number, and the result will be reconlized as a neg number
					anw += 65536;
				}
				var anwHex = Number(anw).toString(16).toUpperCase();
				for (var j = anwHex.length; j < 4; j++) anwHex = '0' + anwHex;
				document.getElementById(x[1]).value = anwHex.toUpperCase();
				break;
			//PROGRAM CONTROL
			//Unconditional Jump
			case 'JMP':
				//Check syntax
				var x = ins.match(/^JMP (.+)$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'JMP: Syntax error.';
					return;
				}
				//Fetch labels
				for (var l = 0; l < 256; l++) {
					var labelName = Number(l).toString(16).toUpperCase();
					for (var j = labelName.length; j < 2; j++) labelName = '0' + labelName;
					labelName = 'ML' + labelName.toUpperCase();
					if (document.getElementById(labelName).value == x[1]) {
						//Setup PC
						document.getElementById('pc').value = l;
						document.getElementById('pcHex').innerHTML = 'PC(Hex): ' + labelName.substr(-2);
						return;
					}
				}
				//Fetch fail
				document.getElementById('status').innerHTML = 'JMP: Cannot find label.';
				return;
				break;
			//Jump on zero
			case 'JZ ':
				//Check syntax
				var x = ins.match(/^JZ (R[0-9A-F]{3})\, (.+)$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'JZ: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'JZ: Register(s) error.';
					return;
				}
				//Get value
				var cond = document.getElementById(x[1]).value;
				if (!this.check(cond,'d')) {
					document.getElementById('status').innerHTML = 'JZ: Source data error.';
					return;
				}
				//Condition
				if (cond == '0000') {
					//Fetch labels
					for (var l = 0; l < 256; l++) {
						var labelName = Number(l).toString(16).toUpperCase();
						for (var j = labelName.length; j < 2; j++) labelName = '0' + labelName;
						labelName = 'ML' + labelName.toUpperCase();
						if (document.getElementById(labelName).value == x[2]) {
							//Setup PC
							document.getElementById('pc').value = l;
							document.getElementById('pcHex').innerHTML = 'PC(Hex): ' + labelName.substr(-2);
							return;
						}
					}
					//Fetch fail
					document.getElementById('status').innerHTML = 'JZ: Cannot find label.';
					return;
				}
				break;
			//Jump on negative
			case 'JN ':
				//Check syntax
				var x = ins.match(/^JN (R[0-9A-F]{3})\, (.+)$/i);
				if (!x) {
					document.getElementById('status').innerHTML = 'JN: Syntax error.';
					return;
				}
				//Check registers
				if (!this.check(x[1],'r')) {
					document.getElementById('status').innerHTML = 'JN: Register(s) error.';
					return;
				}
				//Get value
				var cond = document.getElementById(x[1]).value;
				if (!this.check(cond,'d')) {
					document.getElementById('status').innerHTML = 'JN: Source data error.';
					return;
				}
				//Condition
				if (parseInt(cond[0]) > 8) {
					//Fetch labels
					for (var l = 0; l < 256; l++) {
						var labelName = Number(l).toString(16).toUpperCase();
						for (var j = labelName.length; j < 2; j++) labelName = '0' + labelName;
						labelName = 'ML' + labelName.toUpperCase();
						if (document.getElementById(labelName).value == x[2]) {
							//Setup PC
							document.getElementById('pc').value = l;
							document.getElementById('pcHex').innerHTML = 'PC(Hex): ' + labelName.substr(-2);
							return;
						}
					}
					//Fetch fail
					document.getElementById('status').innerHTML = 'JN: Cannot find label.';
					return;
				}
				break;
			//END
			case 'END':
				this.stop();
				break;
			//ERROR
			//Syntax error, method not supported
			default:
				if (ins != '') {
					document.getElementById('status').innerHTML = 'ERROR: Syntax error.';
					return;
				}
		}
		document.getElementById('pc').value++;
		var hex = Number(document.getElementById('pc').value).toString(16).toUpperCase();
		for (var j = hex.length; j < 2; j++) hex = '0' + hex;
		document.getElementById('pcHex').innerHTML = 'PC(Hex): ' + hex;
	};
	//Check a value
	this.check = function(checking,type) {
		switch(type) {
			//Register address
			case 'r':
				if (!/^R0[0-9A-F]{2}$/.test(checking)) return false;
				break;
			//Memory address (pointer)
			case 'm':
				if (!/^M[0-3][0-9A-F]{2}$/.test(checking)) return false;
				break;
			//Data value
			case 'd':
				if (!/^[0-9A-F]{4}$/.test(checking)) return false;
				break;
			default:
				return false;
		}
		return true;
	}
}