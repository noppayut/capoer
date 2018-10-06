var note2num = {
	'C': 0,		
	'C#': 1,
	'D': 2,
	'D#': 3,
	'E': 4,
	'F': 5,
	'F#': 6,
	'G': 7,
	'G#': 8,
	'A': 9,
	'Bb': 10,
	'B': 11
};

var escapechar = '\n';
var replacechar = '-';

var num2note = swap(note2num);

var chords;
var capo = 0;

var halftone = {
	'#': 1,
	'b': -1
};

var noofsteps = 12;

function swap(notenum){
	var swapped = {};
	for (var key in notenum){
		swapped[notenum[key]] = key;
	}
	return swapped;
}

function transpose(chords, capo) {
	newchords = [];
	var step = -1;
	if (capo >= 0) {
		step *= capo % noofsteps;
	}
	else {
		step *= noofsteps + capo;
	}

	var chordval = 0;
	var plus = 0;	
	var procchord = '';
	var accent = '';
	var sharpflat = '';
	var newchord = '';
	for (var i in chords) {
		var chord = chords[i];		
		if (chord == replacechar) {			
			newchords.push(chord);
			continue;
		}
		procchord = '';
		accent = '';
		sharpflat = '';

		if (chord.includes('#') || chord.includes("b")){
			procchord = chord[0].toUpperCase();
			sharpflat = chord[1];
			
			accent = chord.slice(2);
			plus = halftone[sharpflat];
		}
		else {
			procchord = chord.slice(0, 1).toUpperCase();
			accent = chord.slice(1);
			plus = 0;
		}
		
		chordval = loopback((note2num[procchord] + plus + step));
		
		var altbase = accent.indexOf('/');
		if (altbase != -1) {
			var newbass = loopback((note2num[accent.slice(altbase + 1).toUpperCase()] + step));
			accent = accent.slice(0, altbase) + "/" + num2note[newbass];
		}
		newchord = num2note[chordval] + accent;
		newchords.push(newchord);
	}
	return newchords;
}

function loopback(num){
	if (num < 0) {
		return noofsteps + num;
	}
	else {
		return num % noofsteps;
	}
}

function findEasietCapo(chords) {	
	var newchords;
	var minscore = 1000000;
	var mincapo = 0;
	var score;
	$(".diff_score").val("Capo, Score\tChords\n");
	for (var capo = 0; capo < noofsteps; capo++) {
		newchords = transpose(chords, capo);
		score = rateSongdDifficulty(newchords);

		$(".diff_score").val($(".diff_score").val() + capo + ", " + score.toFixed(3) + '\t' + newchords.filter(w => w != replacechar).filter((v, i, a) => a.indexOf(v) === i) + "\n");
		if (score < minscore) {
			mincapo = capo;
			minscore = score;
		}
	}
	return mincapo;
}

function rateSongdDifficulty(chords) {	
	var openchords = [
	'C', 'C7', 'CMAJ7'
	, 'D', 'DM', 'DM7', 'DMAJ7', 'D7', 'DSUS4'
	, 'E', 'EM', 'EM7'
	, 'FMAJ7'
	, 'G', 'G7'
	, 'AM', 'AM7', 'A', 'A7', 'ASUS2', 'ASUS4'];
	var fullfingereasychords = [
	'F', 'F#', 'BM', 'CM', 'C#M7', 'BM7', 'CM7', 'C#M7'
	];

	var score = 0;
	var nobasschord;
	for (var i in chords) {
		var chord = chords[i];
		var bassindex = chord.indexOf('/');
		if (bassindex == -1) {
			nobasschord = chord.toUpperCase();
		}
		else {
			nobasschord = chord.slice(0, bassindex).toUpperCase();
		}
		//nobasschord = chord.toUpperCase();

		if (openchords.includes(nobasschord)){
			score += 1;
		}
		else if (fullfingereasychords.includes(nobasschord)){
			score += 2;
		}
		else {
			score += 3;
		}		
	}

	return (score*1.0)/(3*chords.length);
}

function parseChord(rawchords) {	
    var chordsstr = rawchords.replace(new RegExp(escapechar, 'g'), " " + replacechar + " ");
    chords = chordsstr.split(" ");
}

function formatChord(processedchords) {	
	return processedchords.join(" ").replace(new RegExp(" " + replacechar + " ", 'g'), escapechar);
}

function inputChord() {
	var rawchords = $(".original_chord").val();
	parseChord(rawchords);	
	var easiestcapo = findEasietCapo(chords);	
	capo = easiestcapo;
	setCapo();
	$(".easiest_capo").html(easiestcapo);
	
}

function up() {
	changeCapo(1);
}

function down() {
	changeCapo(-1);
}

function changeCapo(dfret) {
	capo += dfret;
	setCapo();
}

function setCapo() {
	var transposedchord = transpose(chords, capo);
	//$(".test").val(transposedchord);
	var formattedchords = formatChord(transposedchord);	
	$(".transposed_chord").val(formattedchords);
	$(".capo").html(capo);
}

/*

Test cases

C#m B A B E D#m7 G#m7

Dm Bb C Dm Bb C Dm Bb C

D C#7 F#m B7 D E D A Bm7 F#m D A
Bm7 F#m D C#7 F#m A Bm7 C#7
D E/D C#m7 Fdim F#m Bm7 E
F#m C#7 D E/D C#m7 Fdim F#m Bm7 E A Dm7
*/