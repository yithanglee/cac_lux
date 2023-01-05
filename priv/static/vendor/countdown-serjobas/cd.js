var Cd = {
  init(dom, options) {


    var default_options = {
      wholeTime: 1 * 60,
      timeleft: 1 * 60,
      isPaused: true

    }

    var keys =
      Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })

    console.log(this.timeleft)

    var container = `
		  <div class="container d-flex align-items-center justify-content-center">
		    <div class="circle">
		      <svg width="300" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
		        <g transform="translate(110,110)">
		          <circle r="100" class="e-c-base" />
		          <g transform="rotate(-90)">
		            <circle r="100" class="e-c-progress" />
		            <g id="e-pointer">
		              <circle cx="100" cy="0" r="8" class="e-c-pointer" />
		            </g>
		          </g>
		        </g>
		      </svg>
		    </div>
		    <div class="position-absolute text-center">
		      <div class="display-remain-time">00:30</div>
		      <button class="play" id="pause">
		        <i class="fa fa-play" id="p1"></i>
		        <i class="fa fa-pause d-none" id="p2"></i>
		      </button>
		    </div>
		  </div>
		`

    $(dom).html(container)

    //circle start
    let progressBar = document.querySelector('.e-c-progress');
    let indicator = document.getElementById('e-indicator');
    let pointer = document.getElementById('e-pointer');
    let length = Math.PI * 2 * 100;

    progressBar.style.strokeDasharray = length;

    function updateTimer(value, timePercent) {
      var offset = -length - length * value / (timePercent);
      progressBar.style.strokeDashoffset = offset;
      pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`;
    };

    //circle ends
    const displayOutput = document.querySelector('.display-remain-time')
    const pauseBtn = document.getElementById('pause');
    const setterBtns = document.querySelectorAll('button[data-setter]');

    let intervalTimer;
    let isPaused = false;
    let isStarted = false;
    var wholeTime = this.wholeTime
    var timeLeft;




    function restartTimer(time_in_seconds) {
      timeLeft = time_in_seconds
      updateTimer(time_in_seconds, time_in_seconds); //refreshes progress bar
      displayTimeLeft(time_in_seconds);
    }
    restartTimer(wholeTime);

    function timer(seconds) { //counts time, takes seconds
      let remainTime = Date.now() + (seconds * 1000);
      displayTimeLeft(seconds);
      intervalTimer = setInterval(function() {
        timeLeft = Math.round((remainTime - Date.now()) / 1000);
        if (timeLeft < 0) {
          clearInterval(intervalTimer);
          isStarted = false;
          setterBtns.forEach(function(btn) {
            btn.disabled = false;
            btn.style.opacity = 1;
          });
          displayTimeLeft(wholeTime);
          pauseBtn.classList.remove('pause');
          pauseBtn.classList.add('play');
          $("#p1").addClass("d-none")
          $("#p2").removeClass("d-none")
          return;
        }
        displayTimeLeft(timeLeft);
      }, 1000);
    }

    function pauseTimer(event) {
      if (isStarted === false) {
        timer(wholeTime);
        isStarted = true;
        this.classList.remove('play');
        this.classList.add('pause');
        $("#p1").addClass("d-none")
        $("#p2").removeClass("d-none")
        setterBtns.forEach(function(btn) {
          btn.disabled = true;
          btn.style.opacity = 0.5;
        });

      } else if (isPaused) {
        this.classList.remove('play');
        this.classList.add('pause');
        $("#p1").addClass("d-none")
        $("#p2").removeClass("d-none")
        timer(timeLeft);
        isPaused = isPaused ? false : true
        window.isPaused = isPaused
      } else {
        $("#p1").removeClass("d-none")
        $("#p2").addClass("d-none")
        this.classList.remove('pause');
        this.classList.add('play');
        clearInterval(intervalTimer);
        isPaused = isPaused ? false : true;
        window.isPaused = isPaused
      }
    }

    function displayTimeLeft(timeLeft) { //displays time on the input
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      document.title = displayString

      displayOutput.textContent = displayString;
      this.timeleft = timeLeft
      window.timeLeft = timeLeft
      updateTimer(timeLeft, wholeTime);
    }

    pauseBtn.addEventListener('click', pauseTimer);




  }
}