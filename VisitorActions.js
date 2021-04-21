/* 
  VisitorAction.js
  track visitor actions, scrolling up, down or paused
  time spent on page, how many pauses for reading
  current location on page
*/

// output variables from pageMovement
var direction, siteTime, pgPercent, pgTime, pgPauses, dvTime, dvPauses, readTest, currentPausedTime;
// pageMovement calculation variables
var scrollPos;
// time variables: vt - visit start time, pt - page start time
// dt - div start time, dp - div start pause count
var vt, pt, dt, dp;
// set variables to zero
pgPauses = dvPauses = scrollPos = dp + currentPausedTime = 0;
// start clocks
vt = pt = dt = performance.now();
// readTest set to empty 
readTest = '';


function pageMovement() {

  // detect scroll direction
  if ((document.body.getBoundingClientRect()).top > scrollPos) {
      direction = 'up';
    } else if ((document.body.getBoundingClientRect()).top < scrollPos) {
      direction = 'down';
    } else {
      if (direction != 'paused') {
        pgPauses++;
        dvPauses++;
      }
      direction = 'paused';
    }

  // saves the new position for iteration.
  scrollPos = (document.body.getBoundingClientRect()).top;

  // measure distance & calculate percentage
  let docHeight = document.body.offsetHeight;
  let winHeight = window.innerHeight;
  let scrollPercent = scrollPos / (docHeight - winHeight);
  pgPercent = Math.abs(Math.round(scrollPercent * 100));

  // update time on page 
  let t1 = performance.now();
  siteTime = (t1 - vt)/1000;
  pgTime = (t1 - pt)/1000;
  dvTime = (t1 - dt)/60000;

  // if readTest activated, start comparing dvTime & dvPauses with estimates
  // once read conditions met change readTest to 'read'
  if (readTest === 'test') {
    if ((dvPauses >= estPauses) && (dvTime >= estTime)) {
      readTest = 'read';
    }
  }
  
  // measure current pause time, use to block popup if just started reading
  if(direction === 'paused') {
    currentPausedTime = currentPausedTime + .250;    
  } else {
    currentPausedTime = 0;
  }

  // trigger pageMonitor once every 250ms
  setTimeout(pageMovement, 250);
}

/* 
  Determining if section read
  Use a combination of number of pauses, total time spend with div in viewport
  to determine if it is likely the visitor actually skimmed the div's content
  Use div height to calculate needed time and minimum pauses
*/

// time needed for reading words in div
// comp (comprehension): skim, read
var estTime, estPauses;
function calcContent(id,comp) {
  var wordsPerMinute;
  if (comp === 'skim') { wordsPerMinute = 1000; } // Average 200 wpm, 20% read
  if (comp === 'read') { wordsPerMinute = 200; }
  var cntnt = document.getElementById(id).textContent;
  let textLength = cntnt.split(" ").length; // Split by words
  if(textLength > 0){
    estTime = Math.abs(textLength / wordsPerMinute);
    estPauses = Math.abs(textLength / 300); // Average words in viewport, adjust for target div layout
  }
};

// trigger observation of specific div (id) and apply function (fn)
function watchDiv(id) {
    // watch for intersection with viewport
    const div2check = document.getElementById(id);
    function uponEnter(entries) {
      entries.map((entry) => {
        if (entry.isIntersecting) {
          strtDiv();
        } else {
          endDiv();
        }
      });
    }
    const observer = new IntersectionObserver(uponEnter);
    observer.observe(div2check);
    if (readTest === 'read') {
      //remove observer
      observer.unobserve(div2check);
    }
}

// trigger observation of specific div (id) and apply function (fn)
function watchCTA(id) {
  // watch for intersection with viewport
  const cta2check = document.getElementById(id);
  function whenSeeIt(entries) {
    entries.map((entry) => {
      if (entry.isIntersecting) {
        hiRqst();
      } else {
        xhiRqst();
      }
    });
  }
  const observer = new IntersectionObserver(whenSeeIt);
  observer.observe(cta2check);
}

// set time clock for div, reset pause count and set readTest to 1 (in process)
function strtDiv() {
  if (direction === 'down') {
    dt = performance.now();
    dvPauses = 0;
    if (readTest === '') {
      readTest = 'test';
    }
  }
}

// check when exiting if readTest successful, if not reset to 0
function endDiv() {
  if (readTest === 'test') {
    readTest = '';
  }
}

// if conditions right add highlight to request info CTA
// change both estimates to (readTest === 'read')
var rqstview = 1;
function hiRqst() {
  if ((rqstview < 3) && (readTest === 'read') && (direction === 'down')) {
    $('rqstinfo').classList.add('inview');
    rqstview++;
  }
}

// remove highlight from request info CTA when scrolls out of view
function xhiRqst() {
    $('rqstinfo').classList.remove('inview');
}

// restart page timer after new page hydration, but preserve site timer
function newPageTime() {
  pt = dt = performance.now();
  pgPauses = dvPauses = scrollPos = 0;
}
