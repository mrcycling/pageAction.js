/* 
  VisitorAction.js
  track visitor actions, scrolling up, down or paused
  time spent on page, how many pauses for reading
  current location on page
*/

/* 
  shared variables
  direction: scrolldirection, up, down, paused
  pausecnt: how many times visitor paused, assume to read or look at items
  pauseTime: current length of pause, use to show items during rest period
  scrollPos: current position on page in pixels
  pagePercent: current position on page as percentage of total page
  visitTime:  total visit time on website
  pageTime: total visit time on webpage (use when hydrating pages)
  divTime: total time a specific div is within the viewport
  tv: start time for visitTime
  tp: start time for PageTime
*/

var direction, pauseTime, pagePercent, visitTime, pageTime, divTime, pausecnt, scrollPos, tv, tp;
// set variables to zero
pausecnt = scrollPos = 0;
// set start time
tv = tp = performance.now();


function pageMovement() {

  // detect scroll direction
  if ((document.body.getBoundingClientRect()).top > scrollPos) {
      direction = 'up';
    } else if ((document.body.getBoundingClientRect()).top < scrollPos) {
      direction = 'down';
    } else {
      if (direction != 'paused') {
        pausecnt++;
      }
      direction = 'paused';
    }
  // test purpose only, remove from production
  document.getElementById('direction').innerHTML = direction + ' - times paused: ' + pausecnt;
  // test purpose end

  // saves the new position for iteration.
  scrollPos = (document.body.getBoundingClientRect()).top;

  // measure distance & calculate percentage
  let docHeight = document.body.offsetHeight;
  let winHeight = window.innerHeight;
  let scrollPercent = scrollPos / (docHeight - winHeight);
  pagePercent = Math.abs(Math.round(scrollPercent * 100));

  // test purpose only, remove from production
  document.getElementById('percent').innerHTML = pagePercent + '%';
  // test purpose end

  // update time on page 
  let t1 = performance.now();
  pageTime = t1 - tp;
  
  // test purpose only, remove from production
  document.getElementById('time').innerHTML = (Math.round(pageTime/1000));
  // test purpose end

  // trigger pageMonitor once every 250ms
  setTimeout(pageMovement, 250);

}

// get total time on website when using hydration
function ttlVisit() {
  var t2 = performance.now();
  visitTime = t2 - tv;
}

// restart page timer after new page hydration
function newPageTime() {
  tp = performance.now();
}


/* 
  Determining if section read divRead = true or false
  Use a combination of number of pauses, total time spend with div in viewport
  to determine if it is likely the visitor actually skimmed the div's content
  Use div height to coalculate needed time and minimum pauses
  7 day tours on laptop:
    day by day 40 secs for 600 words, plus minimum of 3 pauses?
    highlights 15 secs, plus minimum of 3 pauses
*/

// time needed for reading words in div
// comp (comprehension): skim, read
var estTime;
var estPauses
function calcContent(id,comp) {
  var wordsPerMinute;
  if (comp === 'skim') { wordsPerMinute = 1000; } // Average 200 wpm, 20% read
  if (comp === 'read') { wordsPerMinute = 200; }
  estPauses = Math.abs(textLength / 250); // Average words in viewport, adjust for target div layout
  var cntnt = document.getElementById(id).innerHTML;
  let textLength = cntnt.split(" ").length; // Split by words
  if(textLength > 0){
    estTime = Math.ceil(textLength / wordsPerMinute);
  }
};

/*
  time spent with div in viewport, variables:
  dt: time of entry into div
  dn: time of exit from div
  ps1, ps2: pause count start and finish
  psnmbr: calculated number of pauses ps2-ps1
*/

var dt, dn, psnmbr, ps1, ps2;
ps1 = ps2 = 0;

function timeForDiv(id) {
  // watch for intersection with viewport
  const div2time = document.getElementById(id);
  function cntTimeDiv(entries) {
    entries.map((entry) => {
      if (entry.isIntersecting) {
        dt = performance.now();
        ps1 = pausecnt;
      } else {
        dn = performance.now();
        ps2 = pausecnt;
        divTime = dn - dt; 
        psnmbr = ps2 - ps1; 

        // test purpose only, remove from production
        document.getElementById('divTime').innerHTML = divTime + ' - paused: ' + psnmbr;
        // test purpose end
      }
    });
  }
  const observer = new IntersectionObserver(cntTimeDiv);
  observer.observe(div2time);

}

/*
  Check if div was probably read
  id = div id
  comp = either 'skim' or 'read', depending on what your audience does
*/
function didRead(id,comp){
  // calculate content details
  calcContent(id,comp);
  // measure action in div
  timeForDiv(id);
  // check if actual values surpassed estimated values
  if (( psnmbr >= estPauses) && (divTime >= estTime)) {
    return true;
  }
}


/*
  Check if visitor bookmarks page, assume interest even without a true 'read'
*/

function bkmrkIt() {
  return true;
}

browser.bookmarks.onCreated.addListener(bkmrkIt);
