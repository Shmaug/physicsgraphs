var pixPerMeter=15;
var mousePos;
var mouseDown;

function ball(m){
    this.image=new Image();
    this.x=0;
    this.y=0;
    this.vx=0;
    this.vy=20;
    this.ax=0;
    this.ay=-9.8;
    this.mass=m;
    this.radius=0;
    this.realx=0;
    this.realy=0;
    this.readrad=0;
    this.forces=[];
};
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function waitForYes(elem){
    if(elem.attr("data-ready")=="no"){
        setTimeout(function(){
            waitForYes(elem);
        },250);
    }
}
function drawArrow(c,x,y,a,d,col){
    var cx=x,cy=y;
    c.beginPath();
    c.strokeStyle=col;
    c.lineWidth=2;
    c.moveTo(cx,cy);
    cx=x+Math.cos(a)*d
    cy=y+Math.sin(a)*d;
    c.lineTo(cx,cy);
    c.lineTo(cx+Math.cos(a-Math.PI*.75)*20,cy+Math.sin(a-Math.PI*75)*20);
    c.lineTo(cx,cy);
    c.lineTo(cx+Math.cos(a+Math.PI*.75)*20,cy+Math.sin(a+Math.PI*75)*20);
    c.stroke();
}
$(document).ready(function(){
    $(".bar").css("width",pixPerMeter+"px");
    var fnetcontainer=$("#cfnet");
    if (fnetcontainer.attr("data-ready")=="no"){
        waitForYes(fnetcontainer);
    };
    var fnetro = fnetcontainer.children("#readout");
    var cfnet = fnetcontainer.children("canvas")[0];
    var fnetctx = cfnet.getContext("2d");
    var b=new ball(1);
    b.image.src="/img/dank.png";
    b.image.onload=function(){ b.realrad=b.image.width/2; b.radius=b.image.width/pixPerMeter * .5; };
    
    canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(cfnet, evt);
    }, false);
    
    function update(time){
        b.forces.push(["#f00","Fg",0,b.mass*-9.8]);
        b.vx+=b.ax*time;
        b.vy+=b.ay*time;
        b.x+=b.vx*time;
        b.y+=b.vy*time;
        if (b.y < b.radius){
            b.forces.push(["#00f","Fn",0,b.mass*9.8]);
            b.y=b.radius;
            b.vy=Math.max(0,b.vy);
        }
        b.realx=b.x*pixPerMeter + cfnet.width/2;
        b.realy=cfnet.height-b.y*pixPerMeter;
        fnetro[0].innerHTML="pos:("+Math.floor(b.x)+","+Math.floor(b.y)+")  vel:("+Math.floor(b.vx)+","+Math.floor(b.vy)+")  "+pixPerMeter+"px=1m";
    }

    function draw(){
        fnetctx.clearRect (0, 0, cfnet.width, cfnet.height);
        fnetctx.drawImage(b.image,b.realx - b.radius*pixPerMeter,b.realy - b.radius*pixPerMeter);
        // draw forces
        var cur=b.forces.pop();
        while (cur){
            var y=cur.pop();
            var x=cur.pop();
            var txt=cur.pop();
            var col=cur.pop();
            var a=Math.atan2(-y,x);
            var len=Math.sqrt(y*y + x*x)*pixPerMeter*.7;
            drawArrow(fnetctx,b.realx,b.realy,a,len,col);
            fnetctx.fillStyle=col;
            fnetctx.font="24px monospace";
            len=len+15;
            var sz=fnetctx.measureText(txt);
            fnetctx.fillText(txt, b.realx+Math.cos(a)*len - sz.width/2, b.realy+Math.sin(a)*len + 12);
            cur=b.forces.pop();
        }
    }

    var main = function(){
        var now = Date.now();
        var delta = now - then;
        update(delta/1000);
        draw();
        then = now;
        requestAnimationFrame(main);
    }

    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

    var then = Date.now();
    main();
});