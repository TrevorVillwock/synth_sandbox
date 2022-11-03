let volSlider;
let pitchSlider;
let cutoffSlider;
let rhythmMenu;

window.onload = function () {
    volSlider = document.getElementById("volumeSlider");
    pitchSlider = document.getElementById("pitchSlider");
    cutoffSlider = document.getElementById("cutoffSlider");
    rhythmMenu = document.getElementById("notes");
}

let vol = new Tone.Volume(-25).toDestination();
let filter = new Tone.Filter(1500, "lowpass").connect(vol);

//const testSynth = new Tone.AMOscillator(100, "sawtooth", "sine", 0.1).connect(vol);

const testSynth = new Tone.Oscillator(200, "sawtooth128").connect(filter);

// Boolean variable indicating whether randomness is turned on or off
let randomSpeed = 0;
let randomPitch = 0;
let basePitch = 0;

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
    console.log("setting pitch");
    console.log("slider value: " + pitchSlider.value);
    testSynth.frequency.value = pitchSlider.value;
    if (pitchSlider.value) basePitch = pitchSlider.value;
}

async function toggleRandomSpeed() {
    //console.log("toggling random speed");
    randomSpeed = !randomSpeed;

    while (randomSpeed) {
        Tone.Transport.bpm.value = 150 + Math.random() * 1000; 
        //console.log("bpm: " + Tone.Transport.bpm.value);
        await new Promise(r => setTimeout(r, (1000*(60 / Tone.Transport.bpm.value))));
    }
}

async function toggleRandomPitch() {
    console.log("toggling random pitch");
    randomPitch = !randomPitch;

    let notes = [100, 200, 300, 400, 500, 600, 700, 800];
    
    while (randomPitch) {

        testSynth.frequency.value = parseInt(basePitch) + parseInt(notes[Math.floor(Math.random() * notes.length)]);
        console.log("pitchslider: " + pitchSlider.value);
        console.log("basePitch: " + basePitch);
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
    // Map a cutoff slider value of 1-1000 to a range of 150 to 
    // 20000 Hertz using exponential scaling.

    filter.frequency.value = 150 + Math.pow(2, cutoffSlider.value);
    console.log(filter.frequency.value);
}