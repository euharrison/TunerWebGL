
/**
 * @author Pedror Rezende / github.com/pedrorezende
 * @author Chris Wilson / http://webaudiodemos.appspot.com/ 
 */
	
var Tuner = function() 
{
	var audioContext;
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new AudioContext();
	}
	catch(e) {
		alert('Web Audio API is not supported in this browser');
	}

	var isPlaying = false;
	var sourceNode = null;
	var analyser = null;
	var theBuffer = null;
	var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	var noteIdx = 0;
	var confidence = 0;
	var rafID = null;
	var tracks = null;
	var buflen = 1024;
	var buf = new Uint8Array( buflen );
	var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

	function convertToMono( input ) {
	    var splitter = audioContext.createChannelSplitter(2);
	    var merger = audioContext.createChannelMerger(2);

	    input.connect( splitter );
	    splitter.connect( merger, 0, 0 );
	    splitter.connect( merger, 0, 1 );
	    return merger;
	}

	function error() {
	    alert('getUserMedia() is not supported in your browser.');
	}

	function hasGetUserMedia() {
	  // Note: Opera is unprefixed.
	  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
	            navigator.mozGetUserMedia || navigator.msGetUserMedia);
	}

	function getUserMedia(dictionary, callback) {
		try {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			navigator.getUserMedia(dictionary, callback, error);
		}
		catch(e) {
			alert('getUserMedia() is not supported in your browser');
		}
	}

	function gotStream(stream) {
	    // Create an AudioNode from the stream.
	    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

	    // Connect it to the destination.
	    analyser = audioContext.createAnalyser();
	    //analyser.fftSize = 2048;
	    analyser.fftSize = 1024;
	    convertToMono( mediaStreamSource ).connect( analyser );
	    updatePitch();
	}

	function getMicrophoneInput() {
	    getUserMedia({audio:true}, gotStream);
	}

	function findNextPositiveZeroCrossing( start ) {
		var i = Math.ceil( start );
		var last_zero = -1;
		// advance until we're zero or negative
		while (i<buflen && (buf[i] > 128 ) )
			i++;
		if (i>=buflen)
			return -1;

		// advance until we're above MINVAL, keeping track of last zero.
		while (i<buflen && ((t=buf[i]) < MINVAL )) {
			if (t >= 128) {
				if (last_zero == -1)
					last_zero = i;
			} else
				last_zero = -1;
			i++;
		}

		// we may have jumped over MINVAL in one sample.
		if (last_zero == -1)
			last_zero = i;

		if (i==buflen)	// We didn't find any more positive zero crossings
			return -1;

		// The first sample might be a zero.  If so, return it.
		if (last_zero == 0)
			return 0;

		// Otherwise, the zero might be between two values, so we need to scale it.

		var t = ( 128 - buf[last_zero-1] ) / (buf[last_zero] - buf[last_zero-1]);
		return last_zero+t;
	}

	function noteFromPitch( frequency ) {
		var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
		return Math.round( noteNum ) + 69;
	}

	function frequencyFromNoteNumber( note ) {
		return 440 * Math.pow(2,(note-69)/12);
	}

	function centsOffFromPitch( frequency, note ) {
		return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
	}

	function updatePitch( time ) {
		var cycles = new Array;
		analyser.getByteTimeDomainData( buf );

		var i=0;
		// find the first point
		var last_zero = findNextPositiveZeroCrossing( 0 );

		var n=0;
		// keep finding points, adding cycle lengths to array
		while ( last_zero != -1) {
			var next_zero = findNextPositiveZeroCrossing( last_zero + 1 );
			if (next_zero > -1)
				cycles.push( next_zero - last_zero );
			last_zero = next_zero;

			n++;
			if (n>1000)
				break;
		}

		// 1?: average the array
		var num_cycles = cycles.length;
		var sum = 0;
		var pitch = 0;

		for (var i=0; i<num_cycles; i++) {
			sum += cycles[i];
		}

		if (num_cycles) {
			sum /= num_cycles;
			pitch = audioContext.sampleRate/sum;
		}

		confidence = (num_cycles ? ((num_cycles/(pitch * buflen / audioContext.sampleRate)) * 100) : 0);
		noteIdx =  noteFromPitch( pitch );
		rafID = window.webkitRequestAnimationFrame( updatePitch );
		
		//console.log(noteStrings[noteIdx % 12]);
		//console.log(confidence);

	}

	getMicrophoneInput();

	// getters

	this.getNotes = function() {
		return noteStrings;
	}

	this.getCurrentNoteIndex = function() {
		return noteIdx % 12;
	}

	this.getCurrentConfidence = function() {
		return confidence;
	}

};