var pixPerMeter=15;
var mouseDown=false;
var mousePos={x:0,y:0};
var mouseWorld={x:0,y:0};
var running=false;
var curCanvas=false;

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
    return {x:toScreenX(m.x),y:toScreenY(m.y)}
}

function toWorldX(p){
    return toMeters(p-curCanvas.width/2);
}
function toWorldY(p){
    return toMeters(curCanvas.height-p);
}
function toWorld(p){
    return {x:toWorldX(p.x),y:toWorldY(p.y)}
}

function drawLine(c,x,y,x2,y2,col){
    c.beginPath();
    c.strokeStyle=col;
    c.lineWidth=2;
    c.moveTo(toScreenX(x),toScreenY(y));
    c.lineTo(toScreenX(x2),toScreenY(y2));
    c.stroke();
}

function drawArrow(c,x,y,a,d,col,txt){
    cx=x+Math.cos(a)*d
    cy=y+Math.sin(a)*d;
    drawLine(c,x,y,cx,cy,col);
    drawLine(c,cx,cy,cx+Math.cos(a-Math.PI*.833)*2,cy+Math.sin(a-Math.PI*.833)*2,col);
    drawLine(c,cx,cy,cx+Math.cos(a+Math.PI*.833)*2,cy+Math.sin(a+Math.PI*.833)*2,col);
    
    if (txt!=""){
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
}

function ball(m,img){
    this.image=new Image();
    this.p={x:0,y:0};
    this.v={x:0,y:0};
    this.a={x:0,y:0};
    this.rp={x:0,y:0};
    this.mass=m;
    this.radius=0;
    this.readrad=0;
    this.forces=[];
    this.image.src=img;
    this.fnet={x:0,y:0};
    this.g=-9.8;
    
    {
        var c=this;
        this.image.onload=function(){
            c.realrad=c.image.width/2;
            c.radius=toMeters(c.image.width/2);
        };
    }
    
    this.setForces=function(groundSlope, groundHeight,groundFriction){
        this.a.x=0;
        this.a.y=0;
        this.forces=[];
        
        // force gravity
        this.forces.push(["#f00","Fg",{x:0,y:this.mass*this.g}]);
        
        // apply force normal and force friction on ground
        if (this.p.y < this.p.x*groundSlope+this.radius+groundHeight){
            this.forces.push(["#00f","Fn",{x:0,y:this.mass*-this.g}]);
            // correct vel and pos
            this.p.y=this.p.x*groundSlope+this.radius+groundHeight-0.01;
            this.v.y=Math.max(0,this.v.y);
            
            if (Math.abs(this.v.x) < .1){
                this.v.x=0;
            }
            else{
                var sgn=1
                if (this.v.x < 0){sgn=-1;}
                this.forces.push(["#f0f","Ff",{x:sgn*this.mass*this.g*groundFriction,y:0}]);
            }
        }
    }
    
    this.applyForces=function(time, d){
        // calc forces
        var f=JSON.parse(JSON.stringify(this.forces));
        var numforces=this.forces.length;
        this.fnet={x:0,y:0}; // the fnet we draw
        var rfnet={x:0,y:0}; // the real fnet
        var cur=f.pop();
        
        var sgfg=0;
        while (cur){
            var vec=cur.pop();
            var txt=cur.pop();
            this.fnet.x+=vec.x;
            this.fnet.y+=vec.y;
            
            rfnet.x+=vec.x;
            rfnet.y+=vec.y;
            
            cur=f.pop();
        }
        rfnet.x/=numforces;
        rfnet.y/=numforces;
        this.fnet.x/=numforces;
        this.fnet.y/=numforces;
        
        this.a.x=rfnet.x/this.mass;
        this.a.y=rfnet.y/this.mass;
        
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
        ctx.drawImage(this.image,this.rp.x - this.realrad,this.rp.y - this.realrad);
        
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
            drawArrow(ctx,this.p.x,this.p.y,Math.atan2(-this.fnet.y,this.fnet.x),len(this.fnet)/15,"#ff0","Fnet");
        }
        // draw vel arrow
        if (len(this.v)>.25){
            drawArrow(ctx,this.p.x,this.p.y,Math.atan2(-this.v.y,this.v.x),len(this.v),"#fff","vel");
        }
    }
}
