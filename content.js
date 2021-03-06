
// BY Eric Qian @ enumc.com
// 03/26/2019
// For r/ApplyingToCollege
// Also welcome to the source code :)
// MIT license applies

// let newCanvas = $('body').prepend('<canvas id="canvas" style="display: block; position: relative;z-index: 1; pointer-events: none;"></canvas>');
let newCanvas = $('body').prepend('<canvas id="canvas" style="display: block; position: absolute; top:0; left:0; z-index: 100; pointer-events: none; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)"; filter: alpha(opacity=50); -moz-opacity:0.5; -khtml-opacity: 0.5; opacity: 0.5;"></canvas>');

let heightMultiplier = 1; // This sets how high you want the confetti to be. 1 is full page, 0.5 is half page. 

console.log("new canvas: ", newCanvas);
$('#canvas').attr('height', '0');
function rootDomain(url) {
    var rightPeriodIndex;
    for (var i = url.length - 1; i >= 0; i--) {
        if (url[i] == '.') {
            //console.log("rightPeriodIndex", i);
            rightPeriodIndex = i;
            var noExtension = url.substr(0, i);
            console.log("this is noExtension var: ", noExtension);
            break;
        }
    }
    var result = noExtension.substring(noExtension.lastIndexOf(".") + 1);
    return result;
}
let collegename = rootDomain(window.location.hostname);
console.log(collegename);
let decisionn = '';
let decisionnColor = "";

function startTheConfetti() {
    // globals
    var canvas;
    var ctx;
    var W;
    var H;
    var mp = 150; //max particles
    var particles = [];
    var angle = 0;
    var tiltAngle = 0;
    var confettiActive = true;
    var animationComplete = true;
    var deactivationTimerHandler;
    var reactivationTimerHandler;
    var animationHandler;

    // objects

    var particleColors = {
        colorOptions: ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"],
        colorIndex: 0,
        colorIncrementer: 0,
        colorThreshold: 10,
        getColor: function () {
            if (this.colorIncrementer >= 10) {
                this.colorIncrementer = 0;
                this.colorIndex++;
                if (this.colorIndex >= this.colorOptions.length) {
                    this.colorIndex = 0;
                }
            }
            this.colorIncrementer++;
            return this.colorOptions[this.colorIndex];
        }
    }

    function confettiParticle(color) {
        this.x = Math.random() * W; // x-coordinate
        this.y = (Math.random() * H) - H; //y-coordinate
        this.r = RandomFromTo(10, 30); //radius;
        this.d = (Math.random() * mp) + 10; //density;
        this.color = color;
        this.tilt = Math.floor(Math.random() * 10) - 10;
        this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
        this.tiltAngle = 0;

        this.draw = function () {
            ctx.beginPath();
            ctx.lineWidth = this.r / 2;
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
            
            ctx.fillStyle = "#003300";
            ctx.font = '160px san-serif';
            var textString = "ACCEPTED!", // collegename.toUpperCase()
                textWidth = ctx.measureText(textString).width;

            ctx.fillText(textString, (W / 3.7), (H / 2)); // used to be 100 as last
            return ctx.stroke();
        }
    }

    $(document).ready(function () {
        SetGlobals();
        InitializeButton();
        InitializeConfetti();

        $(window).resize(function () {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H * heightMultiplier;
        });

    });

    function InitializeButton() {
        $('#stopButton').click(DeactivateConfetti);
        $('#startButton').click(RestartConfetti);
    }

    function SetGlobals() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H * heightMultiplier;
    }

    function InitializeConfetti() {
        particles = [];
        animationComplete = false;
        for (var i = 0; i < mp; i++) {
            var particleColor = particleColors.getColor();
            particles.push(new confettiParticle(particleColor));
        }
        StartConfetti();
    }

    function Draw() {
        ctx.clearRect(0, 0, W, H);
        var results = [];
        for (var i = 0; i < mp; i++) {
            (function (j) {
                results.push(particles[j].draw());
            })(i);
        }
        Update();

        return results;
    }

    function RandomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }


    function Update() {
        var remainingFlakes = 0;
        var particle;
        angle += 0.01;
        tiltAngle += 0.1;

        for (var i = 0; i < mp; i++) {
            particle = particles[i];
            if (animationComplete) return;

            if (!confettiActive && particle.y < -15) {
                particle.y = H + 100;
                continue;
            }

            stepParticle(particle, i);

            if (particle.y <= H) {
                remainingFlakes++;
            }
            CheckForReposition(particle, i);
        }

        if (remainingFlakes === 0) {
            StopConfetti();
        }
    }

    function CheckForReposition(particle, index) {
        if ((particle.x > W + 20 || particle.x < -20 || particle.y > H) && confettiActive) {
            if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
            {
                repositionParticle(particle, Math.random() * W, -10, Math.floor(Math.random() * 10) - 20);
            } else {
                if (Math.sin(angle) > 0) {
                    //Enter from the left
                    repositionParticle(particle, -20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                } else {
                    //Enter from the right
                    repositionParticle(particle, W + 20, Math.random() * H, Math.floor(Math.random() * 10) - 20);
                }
            }
        }
    }
    function stepParticle(particle, particleIndex) {
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
        particle.x += Math.sin(angle);
        particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
    }

    function repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
        particle.x = xCoordinate;
        particle.y = yCoordinate;
        particle.tilt = tilt;
    }

    function StartConfetti() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H * heightMultiplier;
        (function animloop() {
            if (animationComplete) return null;
            animationHandler = requestAnimFrame(animloop);
            return Draw();
        })();
    }

    function ClearTimers() {
        clearTimeout(reactivationTimerHandler);
        clearTimeout(animationHandler);
    }

    function DeactivateConfetti() {
        confettiActive = false;
        ClearTimers();
    }

    function StopConfetti() {
        animationComplete = true;
        if (ctx == undefined) return;
        ctx.clearRect(0, 0, W, H);
    }

    function RestartConfetti() {
        ClearTimers();
        StopConfetti();
        reactivationTimerHandler = setTimeout(function () {
            confettiActive = true;
            animationComplete = false;
            InitializeConfetti();
        }, 100);

    }

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();
};

function startTheDenial() {
    // globals
    var canvas;
    var ctx;
    var W;
    var H;
    var mp = 150; //max particles
    var particles = [];
    var angle = 0;
    var tiltAngle = 0;
    var confettiActive = true;
    var animationComplete = true;
    var deactivationTimerHandler;
    var reactivationTimerHandler;
    var animationHandler;
    
    $(document).ready(function () {
        SetGlobals();
        DrawMyText();

        $(window).resize(function () {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H * heightMultiplier;
        });

    });

    function SetGlobals() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H * heightMultiplier;
    }
    
    function DrawMyText() {
        ctx.fillStyle = decisionnColor;
        ctx.font = '100px san-serif';
        var textString = decisionn, // collegename.toUpperCase()
            textWidth = ctx.measureText(textString).width;
        ctx.fillText(textString, (W / 4), (H / 2)); // last one was 100
    }

    function RandomFromTo(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    function ClearTimers() {
        clearTimeout(reactivationTimerHandler);
        clearTimeout(animationHandler);
    }

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();
};

function acceptRoutine() {
    startTheConfetti();
    // $(".confetti-canvas").appendTo('head');
    accepted = true;
}

function deniedRoutine() {
    // $(".confetti-canvas").appendTo('head');
    startTheDenial();
    accepted = true;
}

// function startMusic() {
    
//     var congratsAudio = new Audio(chrome.runtime.getURL("soundtrack1.mp3"));
//     congratsAudio.play();

// }
console.log("checking for accep");

let accepted = false;
// if ($('iframe')[0].contentWindow != null) {
//     console.log($('iframe')[0].contentWindow.document.documentElement.textContent);
// }
// startTheConfetti();
function checkAccept() {
    console.log("Rechecking for changes");
    if (!accepted) {
        // if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Congratulation') > -1) {
        //     console.log('method 1: Woot woot!');
        //     // startConfetti();
        //     accepted = true;
        // }
        if ($("*:contains('Congratulation')").length > 0 || $("*:contains('congratulation')").length > 0) {
            // $("body").wrap( "<canvas id='congrats'></canvas>" );
            console.log('default accept detected: Woot woot!');
            acceptRoutine();
        }
        else if ($("*:contains('defer')").length > 0 || $("*:contains('Defer')").length > 0) {
            console.log("default deferred detected: Still a chance!");
            decisionn = "Deferred, Still a chance!";
            decisionnColor = "#FF7300";
            deniedRoutine();
        }
        else if ($("*:contains('regret')").length > 0 || $("*:contains('denied')").length > 0 || $("*:contains('Denied')").length > 0 || $("*:contains('rejected')").length > 0 || $("*:contains('Rejected')").length > 0) {
            console.log('default denied detected: Aww :(');
            decisionn = "Denied, It's ok though!";
            decisionnColor = "#FF0000";
            deniedRoutine();
        }
        // console.log($('iframe')[0]);
        try {
            if ($('iframe')[0] != null) {
                if (
                    (
                        ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('Congratulation') > -1 || ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('congratulation') > -1)
                ) {
                    console.log('iframe accept detected: Woot woot!');
                    acceptRoutine();
                }
                else if (
                    (
                        ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('defer') > -1 || ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('Defer') > -1)
                ) {
                    console.log("iframe deferred detected: There's still a chance!");
                    decisionn = "Deferred, Still a chance!";
                    decisionnColor = "#FF7300";
                    deniedRoutine();
                }
                else if (
                    (
                        ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('regret') > -1 || ($('iframe')[0].contentWindow.document.documentElement.textContent || $('iframe')[0].contentWindow.document.documentElement.innerText).indexOf('Denied') > -1)
                ) {
                    console.log('iframe denied detected: Aww :(');
                    decisionn = "Denied, It's ok though!";
                    decisionnColor = "#FF0000";
                    deniedRoutine();
                }
            }
            else {
                console.log('iframe does not exist');
            }
        }
        catch (err) {
            console.warn("iframe policy blocked access to contentWindow unfortunately, so detection might not be as through: ", err);
        }
        

        setTimeout(checkAccept, 1000);
    }
        
}

checkAccept();
