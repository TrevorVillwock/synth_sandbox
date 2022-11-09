let volSlider;
let pitchSlider;
let cutoffSlider;
let rhythmMenu;

window.onload = function () {
    volSlider = document.getElementById("volumeSlider");
    pitchSlider = document.getElementById("pitchSlider");
    cutoffSlider = document.getElementById("cutoffSlider");
    amSlider = document.getElementById("amSlider");
    lfoRateSlider = document.getElementById("lfoRateSlider");
    lfoRangelider = document.getElementById("lfoRangeSlider");
    lfoOffsetSlider = document.getElementById("lfoOffsetSlider");
    rhythmMenu = document.getElementById("notes");
}

let vol = new Tone.Volume(-25).toDestination();
let filter = new Tone.Filter(1500, "lowpass").connect(vol);

const testSynth = new Tone.AMOscillator(100, "sawtooth64", "sine", 0.1).connect(filter);
const lfo1 = new Tone.LFO(1, 0, 100);
let lfoRange = 100;
lfo1.connect(testSynth.frequency);
lfo1.start();

//const testSynth = new Tone.Oscillator(200, "sawtooth128").connect(filter);

// Boolean variable indicating whether randomness is turned on or off
let randomSpeed = 0;
let randomPitch = 0;

// Set default value for BPM (beats per minute). 60 BPM is one beat per second.
Tone.Transport.bpm.value = 60;

let clock = Tone.Transport.scheduleRepeat((time) => {
    console.log("frequency: " + testSynth.frequency.value)
    testSynth.start(time).stop(time + 0.05);
}, "4n");

// Run when start button is clicked
function start() {
    Tone.start();
    Tone.Transport.start();
}

// Run when the stop button is clicked
function stop() {
    Tone.Transport.stop();
}

function setVolume() {
    
    /************************************************************
    The html slider gives us values 0-200, which we map
    to be between -100 and 0 dB because that's what the
    Tone.js Volume object expects.
    For an explanation of how decibels work check out this page:
    https://ehomerecordingstudio.com/decibels/
    *************************************************************/ 
  
    if (volSlider.value != 0) {
      vol.volume.value = -1 * (100 - 13 * Math.log2(volSlider.value));
      
      //console.log("volume: " + vol.volume.value);
    }
}

function setPitch() {
    console.log("setting pitch with LFO");
    console.log("slider value: " + pitchSlider.value);
    let lfoTop = parseInt(pitchSlider.value) + lfoRange;
    let lfoBottom = parseInt(pitchSlider.value) - lfoRange;
    lfo1.set({max: lfoTop, min: lfoBottom});
}

async function toggleRandomSpeed() {
    //console.log("toggling random speed");
    randomSpeed = !randomSpeed;

    while (randomSpeed) {
        Tone.Transport.bpm.value = 40 + Math.random() * 360; 
        //console.log("bpm: " + Tone.Transport.bpm.value);
        await new Promise(r => setTimeout(r, (1000*(60 / Tone.Transport.bpm.value))));
    }
}

async function toggleRandomPitch() {
    console.log("toggling random pitch");
    randomPitch = !randomPitch;

    // The first 3 octaves of the harmonic series, consisting of 8 pitches
    let notes = [100, 200, 300, 400, 500, 600, 700, 800];
    
    while (randomPitch) {
        let lfoTop = parseInt(pitchSlider.value) + parseInt(notes[Math.floor(Math.random() * notes.length)]) + lfoRange;
        let lfoBottom = parseInt(pitchSlider.value) + parseInt(notes[Math.floor(Math.random() * notes.length)]) - lfoRange;
        lfo1.set({min: lfoBottom, max: lfoTop});
        console.log("pitchslider: " + pitchSlider.value);
        await new Promise(r => setTimeout(r, (1000*(60 / Tone.Transport.bpm.value))));
    }
}

function setRhythm() {
    let note = rhythmMenu.value;
    Tone.Transport.clear(clock)
    clock = Tone.Transport.scheduleRepeat((time) => {
        testSynth.start(time).stop(time + 0.05);
    }, note);
    console.log("set rhythmic value");
}

function setFilterCutoff() {
    // Map a cutoff slider value of 1-14.3 to a range of 150 to 
    // 20000 Hertz using exponential scaling. 20000 Hz is the highest 
    // most humans can hear, and 2^14.3 equals approximately 20000.

    filter.frequency.value = 150 + Math.pow(2, cutoffSlider.value);
    console.log(filter.frequency.value);
}

function setAMFreq() {
    testSynth.set({harmonicity: amSlider.value});
    console.log("set AM frequency");
}

function setLfoRate(){
    lfo1.set({frequency: Math.log2(lfoRateSlider.value)})
    console.log()
}

function setLfoRange(){
    lfoRange = lfoRangelider.value;
    lfo1.set({max: lfoRangelider.value + lfo1.min})
}

function setLfoOffset(){
    lfo1.set({min: lfoOffsetSlider.value})  
}