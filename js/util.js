var pixPerMeter=15;
var mouseDown=false;
var mousePos={x:0,y:0};

function dist(a,b){
    var x=a.x-b.x;
    var y=a.y-b.y;
    return Math.sqrt(x*x + y*y);
}
function len(a){
    return Math.sqrt(a.x*a.x + a.y*a.y);
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
    if (txt!=""){
        c.fillStyle=col;
        c.font="24px monospace";
        d=d+15;
        var sz=c.measureText(txt);
        c.fillText(txt, x+Math.cos(a)*d - sz.width/2, y+Math.sin(a)*d + 12);
    }
}

function initCanvas(jcanvas){
    jcanvas.on('mousemove', function(e) {
        mousePos.x=e.clientX-jcanvas.offset().left;
        mousePos.y=e.clientY-jcanvas.offset().top;
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
    
    {
        var c=this;
        this.image.onload=function(){
            c.realrad=c.image.width/2;
            c.radius=c.image.width/pixPerMeter*.5;
        };
    }
    
    this.setForces=function(){
        this.a.x=0;
        this.a.y=0;
        this.forces=[];
        
        // force gravity
        this.forces.push(["#f00","Fg",{x:0,y:this.mass*-9.8}]);
        
        // apply force normal and force friction on ground
        if (this.p.y < this.radius){
            this.forces.push(["#00f","Fn",{x:0,y:this.mass*9.8}]);
            // correct vel and pos
            this.p.y=this.radius;
            this.v.y=Math.max(0,this.v.y);
            
            if (Math.abs(this.v.x) < .1){
                this.v.x=0;
            }
            else{
                var sgn=1
                if (this.v.x < 0){sgn=-1;}
                this.forces.push(["#f0f","Ff",{x:-(sgn)*(this.mass*9.8)*(.8),y:0}]);
            }
        }
    }
    
    this.applyForces=function(time, d){
        // calc forces
        var f=JSON.parse(JSON.stringify(this.forces));
        var last={x:0,y:0};
        var fnet={x:0,y:0};
        var cur=f.pop();
        while (cur){
            var vec=cur.pop();
            fnet.x+=vec.x;
            fnet.y+=vec.y;
            
            last=vec;
            cur=f.pop();
        }
        this.a.x=fnet.x/this.mass;
        this.a.y=fnet.y/this.mass;
        if (len(this.a)<.1){
            this.a={x:0,y:0};
        }
        
        // basic physics
        this.v.x+=this.a.x*time;
        this.v.y+=this.a.y*time;
        this.p.x+=this.v.x*time;
        this.p.y+=this.v.y*time;
        this.rp.x=this.p.x*pixPerMeter + d.width/2;
        this.rp.y=d.height-this.p.y*pixPerMeter;
    }
    
    this.draw=function(c,ctx){
        ctx.drawImage(this.image,this.rp.x - this.radius*pixPerMeter,this.rp.y - this.radius*pixPerMeter);
        
        var fnet={x:0,y:0};
        var cur=this.forces.pop();
        while (cur){
            var vec=cur.pop();
            var txt=cur.pop();
            var col=cur.pop();
            var a=Math.atan2(-vec.y,vec.x);
            var l=len(vec)/pixPerMeter * 15;
            drawArrow(ctx,this.rp.x,this.rp.y,a,l,col,txt);

            fnet.x+=vec.x;
            fnet.y+=vec.y;
            
            cur=this.forces.pop();
        }
        // draw fnet arrow
        if (len(fnet)>1){
            drawArrow(ctx,this.rp.x,this.rp.y,Math.atan2(-fnet.y,fnet.x),len(fnet)/pixPerMeter * 7,"#ff0","Fnet");
        }
    }
}
