var pixPerMeter=15;
var mouseDown=false;
var mousePos={x:0,y:0};

function ball(m){
    this.image=new Image();
    this.x=0;
    this.y=0;
    this.vx=0;
    this.vy=20;
    this.ax=0;
    this.ay=0;
    this.mass=m;
    this.radius=0;
    this.realx=0;
    this.realy=0;
    this.readrad=0;
    this.forces=[];
};
function waitForYes(elem){
    if(elem.attr("data-ready")=="no"){
        setTimeout(function(){
            waitForYes(elem);
        },250);
    }
}
function drawArrow(c,x,y,a,d,col,txt){
    var cx=x,cy=y;
    c.beginPath();
    c.strokeStyle=col;
    c.lineWidth=2;
    c.moveTo(cx,cy);
    cx=x+Math.cos(a)*d
    cy=y+Math.sin(a)*d;
    c.lineTo(cx,cy);
    c.lineTo(cx+Math.cos(a-Math.PI*.833)*20,cy+Math.sin(a-Math.PI*.833)*20);
    c.lineTo(cx,cy);
    c.lineTo(cx+Math.cos(a+Math.PI*.833)*20,cy+Math.sin(a+Math.PI*.833)*20);
    c.stroke();
    
    c.fillStyle=col;
    c.font="24px monospace";
    d=d+15;
    var sz=c.measureText(txt);
    c.fillText(txt, x+Math.cos(a)*d - sz.width/2, y+Math.sin(a)*d + 12);
}
$(document).ready(function(){
    $(".bar").css("width",pixPerMeter+"px");
    var fnetcontainer=$("#cfnet");
    if (fnetcontainer.attr("data-ready")=="no"){
        waitForYes(fnetcontainer);
    };
    var fnetro = fnetcontainer.children("#readout");
    var jcfnet = fnetcontainer.children("canvas");
    var cfnet = jcfnet[0];
    var fnetctx = cfnet.getContext("2d");
    var b=new ball(10);
    b.image.src="/img/dank.png";
    b.image.onload=function(){ b.realrad=b.image.width/2; b.radius=b.image.width/pixPerMeter * .5; };
    
    jcfnet.on('mousemove', function(e) {
        mousePos.x=e.clientX-jcfnet.offset().left;
        mousePos.y=e.clientY-jcfnet.offset().top;
    });
    jcfnet.on('mousedown', function(e) {
        mouseDown=true;
    });
    jcfnet.on('mouseup', function(e) {
        mouseDown=false;
    });
    
    function update(time){
        b.ax=0;
        b.ay=0;
        b.forces=[];
        b.forces.push(["#f00","Fg",0,b.mass*-9.8]);
        if (b.y < b.radius){
            b.forces.push(["#00f","Fn",0,b.mass*9.8]);
            b.y=b.radius;
            b.vy=Math.max(0,b.vy);
            if (Math.abs(b.vx) < .1){
                b.vx=0;
            }
            else{
                var sgn=1
                if (b.vx < 0){sgn=-1;}
                b.forces.push(["#f0f","Ff",-(sgn)*(b.mass*9.8)*(.8),0]);
            }
        }
        if (mouseDown){
            var fa=-Math.atan2(mousePos.y-b.realy,mousePos.x-b.realx);
            var d=Math.min(Math.sqrt((mousePos.y-b.realy)*(mousePos.y-b.realy) + (mousePos.x-b.realx)*(mousePos.x-b.realx))/pixPerMeter*2,20);
            var fx=Math.cos(fa)*b.mass*d;
            var fy=Math.sin(fa)*b.mass*d;
            b.forces.push(["#0f0","Fapp",fx,fy]);
        }
        // draw ball
        fnetctx.clearRect (0, 0, cfnet.width, cfnet.height);
        fnetctx.drawImage(b.image,b.realx - b.radius*pixPerMeter,b.realy - b.radius*pixPerMeter);
        // calc and draw forces
        var b4={x:0,y:0};
        var fnet={x:0,y:0};
        var cur=b.forces.pop();
        while (cur){
            var y=cur.pop();
            var x=cur.pop();
            var txt=cur.pop();
            var col=cur.pop();
            var a=Math.atan2(-y,x);
            var len=Math.sqrt(y*y + x*x)/pixPerMeter * 15;
            drawArrow(fnetctx,b.realx,b.realy,a,len,col,txt);
            
            b4.x=b.ax;
            b4.y=b.ay;
            if (txt=="Fn"){ // don't actually apply Fn
                b.ax=b4.x;
                b.ay=b4.y;
            }
            else{
                b.ax+=x/b.mass;
                b.ay+=y/b.mass;
            }
            fnet.x+=x;
            fnet.y+=y;
            
            cur=b.forces.pop();
        }
        if (fnet.x*fnet.x + fnet.y*fnet.y > 2){
            // draw fnet arrow
            drawArrow(fnetctx,b.realx,b.realy,Math.atan2(-fnet.y,fnet.x),Math.sqrt(fnet.y*fnet.y + fnet.x*fnet.x)/pixPerMeter * 7,"#ff0","Fnet");
        }
        
        b.vx+=b.ax*time;
        b.vy+=b.ay*time;
        b.x+=b.vx*time;
        b.y+=b.vy*time;
        b.realx=b.x*pixPerMeter + cfnet.width/2;
        b.realy=cfnet.height-b.y*pixPerMeter;
        fnetro[0].innerHTML="pos:("+Math.floor(b.x)+","+Math.floor(b.y)+")  vel:("+Math.floor(b.vx)+","+Math.floor(b.vy)+")  "+ "accel:("+Math.floor(b.ax)+","+Math.floor(b.ay)+")   " +pixPerMeter+"px=1m";
    }

    var main = function(){
        var now = Date.now();
        var delta = now - then;
        update(delta/1000);
        then = now;
        requestAnimationFrame(main);
    }

    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

    var then = Date.now();
    main();
});