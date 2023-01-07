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
    lfoRangeSlider = document.getElementById("lfoRangeSlider");
    lfoOffsetSlider = document.getElementById("lfoOffsetSlider");
    rhythmMenu = document.getElementById("notes");
}

// The first 3 octaves and first 8 pitches of the harmonic series starting on approximately G2 (98 Hz), 
// an octave and a fourth below middle C 
let notes = [100, 200, 300, 400, 500, 600, 700, 800];
let noteLength = "+0.5";

let vol = new Tone.Volume(-25).toDestination();
let filter = new Tone.Filter(1500, "lowpass").connect(vol);

const testSynth = new Tone.AMOscillator(100, "sawtooth64", "sine", 0.1).connect(filter);
const lfo1 = new Tone.LFO(0, 1, 2);
let lfoRange = 1;
lfo1.connect(testSynth.frequency);
lfo1.start();

// Boolean variable indicating whether randomness is turned on or off
let randomSpeed = 0;
let randomPitch = 0;

// Set default value for BPM (beats per minute). 60 BPM is one beat per second.
Tone.Transport.bpm.value = 60;

let clock = Tone.Transport.scheduleRepeat(() => {
    //console.log("synth frequency: " + testSynth.frequency.value)
    testSynth.start()
    testSynth.stop(noteLength);
}, "4n");

console.log(`clock: ${clock}`);

// Run when start button is clicked
function start() {
    Tone.Transport.start();
}

// Run when the stop button is clicked
function stop() {
    //Tone.stop();
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
  
    // log2(0) is undefined and will throw an error since there's no power of 2 that equals zero.
    if (volSlider.value != 0) {
        vol.volume.value = -1 * (100 - 13 * Math.log2(volSlider.value));
    }
}

function setPitch() {
    //console.log("setting pitch with LFO");
    //console.log("slider value: " + pitchSlider.value);
    let lfoTop = parseInt(pitchSlider.value) * lfoRange;
    let lfoBottom = parseInt(pitchSlider.value) / lfoRange;
    lfo1.set({max: lfoTop, min: lfoBottom});
}

function updateSettings() {
    
    console.log("cancelling Transport");
    Tone.Transport.cancel(clock);
    //Tone.Transport.stop();
    console.log("transport cancelled");
    console.log("setting new clock");

    let now = Tone.now()

    if (randomSpeed && randomPitch) {
        console.log("both");
        clock = Tone.Transport.scheduleRepeat(() => {
            setLfo();
            Tone.Transport.bpm.value = 40 + Math.random() * 360;
            testSynth.start();
            testSynth.stop(noteLength);
            console.log("playing from randomSpeed & randomPitch");
        }, rhythmMenu.value, startTime=now);
    } else if (randomSpeed) {
        clock = Tone.Transport.scheduleRepeat(() => {
            Tone.Transport.bpm.value = 40 + Math.random() * 360;
            testSynth.start();
            testSynth.stop(noteLength);
            console.log("playing from randomSpeed");
        }, rhythmMenu.value, startTime=now);
    } else if (randomPitch) {
        let clock = Tone.Transport.scheduleRepeat((time) => {
            /* let lfoTop = parseInt(pitchSlider.value) + notes[Math.floor(Math.random() * notes.length)] + lfoRange;
            let lfoBottom = parseInt(pitchSlider.value) + notes[Math.floor(Math.random() * notes.length)] - lfoRange;
            lfo1.set({min: lfoBottom, max: lfoTop}); */
            setLfo();
            testSynth.start();
            testSynth.stop(noteLength);
            console.log("playing from randomPitch");
        }, rhythmMenu.value, startTime=now);
    } else {
        let clock = Tone.Transport.scheduleRepeat(() => {
            testSynth.start();
            testSynth.stop(noteLength);
            console.log("playing normally");
        }, rhythmMenu.value, startTime=now);
    }

    //Tone.Transport.start();

    console.log("new clock set");
}

function setLfo() {
    let lfoTop = (parseInt(pitchSlider.value) + notes[Math.floor(Math.random() * notes.length)]) * lfoRange;
    let lfoBottom = (parseInt(pitchSlider.value) + notes[Math.floor(Math.random() * notes.length)]) / lfoRange;
    lfo1.set({min: lfoBottom, max: lfoTop});
}

function toggleRandomSpeed() {
    //console.log("toggling random speed");
    randomSpeed = !randomSpeed;
    updateSettings();
}

function toggleRandomPitch() {
    //console.log("toggling random pitch");
    randomPitch = !randomPitch;
    updateSettings();
}

function setRhythm() {
    updateSettings(); 
    //console.log("set rhythmic value");
}

function setFilterCutoff() {
    // Map a cutoff slider value of 1-14.3 to a range of 150 to 
    // 20000 Hertz using exponential scaling. 20000 Hz is the highest 
    // most humans can hear, and 2^14.3 equals approximately 20000.
    // We use exponential scaling to make it so that our ears percieve
    // an even slide across the frequency range.
    filter.frequency.value = 150 + Math.pow(2, cutoffSlider.value);
    console.log(filter.frequency.value);
}

function setAMFreq() {
    testSynth.set({harmonicity: amSlider.value});
    // console.log("set AM frequency");
}

function setLfoRate(){
    lfo1.set({frequency: Math.log2(lfoRateSlider.value) - 1})
    // console.log(`lfo frequency: ${lfo1.frequency.value}`);
}

function setLfoRange(){
    lfoRange = lfoRangeSlider.value;
    setLfo();
    // console.log("lfo1 max: " + lfo1.max)
    // console.log("lfo1 min: " + lfo1.min)
}

function closeModal() {
    let modal = document.getElementById("popup");
    /* console.log("modal:")
    console.log(modal)
    console.log("closing modal"); */
    modal.style.display="none";
    Tone.start();
}