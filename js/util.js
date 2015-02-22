var pixPerMeter=15;
var mouseDown=false;
var mousePos={x:0,y:0};
var mouseWorld={x:0,y:0};
var running=false;
var curCanvas;
var curContext;

function dist(a,b){
    var x=a.x-b.x;
    var y=a.y-b.y;
    return Math.sqrt(x*x + y*y);
}

function len(a){
    return Math.sqrt(a.x*a.x + a.y*a.y);
}

function toPixels(m){
    return m*pixPerMeter;
}
function toMeters(p){
    return p/pixPerMeter;
}

function toScreenX(m){
    return toPixels(m)+curCanvas.width/2;
}
function toScreenY(m){
    return curCanvas.height-toPixels(m);
}
function toScreen(m){
    return {x:toScreenX(m.x),y:toScreenY(m.y)};
}

function toWorldX(p){
    return toMeters(p-curCanvas.width/2);
}
function toWorldY(p){
    return toMeters(curCanvas.height-p);
}
function toWorld(p){
    return {x:toWorldX(p.x),y:toWorldY(p.y)};
}

function drawLine(c,x,y,x2,y2,col){
    c.beginPath();
    c.strokeStyle=col;
    c.lineWidth=2;
    c.moveTo(toScreenX(x),toScreenY(y));
    c.lineTo(toScreenX(x2),toScreenY(y2));
    c.stroke();
}

function drawCircle(c,x,y,rad,col){
    c.beginPath();
    c.arc(toScreenX(x),toScreenY(y),toPixels(rad),0,2*Math.PI,false);
    c.fillStyle=col;
    c.fill();
}

function drawArrow(c,x,y,a,d,col,txt){
    var cx=x+Math.cos(a)*d;
    var cy=y+Math.sin(a)*d;
    drawLine(c,x,y,cx,cy,col);
    drawLine(c,cx,cy,cx+Math.cos(a-Math.PI*.833)*2,cy+Math.sin(a-Math.PI*.833)*2,col);
    drawLine(c,cx,cy,cx+Math.cos(a+Math.PI*.833)*2,cy+Math.sin(a+Math.PI*.833)*2,col);
    
    if (txt!==""){
        c.fillStyle=col;
        c.font="24px monospace";
        d=d+1;
        var sz=c.measureText(txt);
        c.fillText(txt, toScreenX(x+Math.cos(a)*d) - sz.width/2, toScreenY(y+Math.sin(a)*d));
    }
}

function initCanvas(jcanvas){
    jcanvas.on('mousemove', function(e) {
        mousePos.x=e.clientX-jcanvas.offset().left;
        mousePos.y=e.clientY-jcanvas.offset().top;
        
        mouseWorld=toWorld(mousePos);
    });
    jcanvas.on('mousedown', function(e) {
        mouseDown=true;
    });
    jcanvas.on('mouseup', function(e) {
        mouseDown=false;
    });
    jcanvas.on('mouseout', function(e) {
        mouseDown=false;
    });
}

function ball(m){
    this.p={x:0,y:10};
    this.v={x:0,y:0};
    this.a={x:0,y:0};
    this.rp={x:0,y:0};
    this.mass=m;
    this.radius=0;
    this.readrad=0;
    this.forces=[];
    this.fnet={x:0,y:0};
    this.g=-9.8;
    this.realrad=toPixels(m/4);
    this.radius=m/4;
    this.close={x:0,y:0};
    
    this.setForces=function(groundSlope, groundHeight, groundFriction){
        this.close={x:this.p.x,y:0};
        if (groundSlope!=0){
            this.close.x=(groundSlope*this.p.x-groundHeight+this.p.y)/(2*groundSlope);
        }
        this.close.y=(groundHeight+groundSlope*this.p.x)/2;
        // apply force normal and force friction on ground
        var d=dist(this.close,this.p)-this.radius
        
        if (d<0){
            
            // force normal shouldn't lift it off the ground
            var a=Math.atan(groundSlope);
            var l=Math.cos(a)*this.mass*-this.g;
            this.forces.push(["#00f","Fn",{x:l*Math.cos(a+.5*Math.PI),y:l*Math.sin(a+.5*Math.PI)}]);
            
            // correct vel and pos
            var cs=Math.cos(a+Math.PI/2);
            var sn=Math.sin(a+Math.PI/2);
            this.v={x:0,y:0};
            this.p.x=this.close.x-this.radius*cs;
            this.p.y=this.close.y+this.radius*sn;
            this.v.x-=this.v.x*cs;
            this.v.y-=this.v.y*sn;
            
            if (len(this.v) < .1){
                this.v={x:0,y:0};
            }
            else{
                var l=len(this.v);
                var d=this.mass*this.g*groundFriction;
                this.forces.push(["#f0f","Ff",{x:this.v.x/l * d,y:this.v.y/l * d}]);
            }
        }
        // force gravity
        this.forces.push(["#f00","Fg",{x:0,y:this.mass*this.g}]);
    }
    
    this.applyForces=function(time, d){
        this.a.x=0;
        this.a.y=0;
        // calc forces
        this.fnet={x:0,y:0}; // the fnet we draw
        
        for (var i=0;i<this.forces.length;i++){
            this.fnet.x+=this.forces[i][2].x;
            this.fnet.y+=this.forces[i][2].y;
        }
        // apply forces
        this.a.x=this.fnet.x/this.mass;
        this.a.y=this.fnet.y/this.mass;
        
        // basic physics
        this.v.x+=this.a.x*time;
        this.v.y+=this.a.y*time;
        this.p.x+=this.v.x*time;
        this.p.y+=this.v.y*time;
        // pixel position
        this.rp.x=toPixels(this.p.x) + d.width/2;
        this.rp.y=d.height-toPixels(this.p.y);
    }
    
    this.draw=function(c,ctx){
        drawCircle(ctx,this.close.x,this.close.y,1,"#fff");
        
        // draw circle
        drawLine(ctx,this.p.x,this.p.y,this.p.x+this.radius,this.p.y,"#333");
        drawCircle(ctx,this.p.x,this.p.y,this.radius,"#000");
        // draw forces
        var cur=this.forces.pop();
        while (cur){
            var vec=cur.pop();
            var txt=cur.pop();
            var col=cur.pop();
            drawArrow(ctx,this.p.x,this.p.y,Math.atan2(vec.y,vec.x),len(vec)/15,col,txt);
            
            cur=this.forces.pop();
        }
        // draw fnet arrow
        if (len(this.fnet)>20){
            drawArrow(ctx,this.p.x,this.p.y,Math.atan2(this.fnet.y,this.fnet.x),len(this.fnet)/15,"#ff0","Fnet");
        }
        // draw vel arrow
        if (len(this.v)>.25){
            drawArrow(ctx,this.p.x,this.p.y,Math.atan2(this.v.y,this.v.x),len(this.v),"#fff","vel");
        }
    };
}
