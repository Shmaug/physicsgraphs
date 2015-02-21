function loadEDemo(){
    $(document).ready(function(){
        $(".bar").css("width",pixPerMeter+"px");
        var econtainer=$("#cenergy");
        
        var canvas = document.createElement("canvas");
        canvas.width=$(".container").width();
        canvas.height=$(".container").height();
        $(".container")[0].appendChild(canvas);
        
        var readout = econtainer.children("#readout");
        var context = canvas.getContext("2d");
        
        var b=new ball(10);
        
        // set up input
        initCanvas(econtainer.children("canvas"));

        function update(time){
            // apply Fapp toward mouse if clicking
            if (mouseDown){
                var f={x:(mouseWorld.x-b.p.x)*15,y:(mouseWorld.y-b.p.y)*15};
                b.forces.push(["#0f0","Fapp",f]);
            }
            
            b.setForces(-.2, 5,0.8);
            
            b.applyForces(time, {width:canvas.width,height:canvas.height});
            
            readout[0].innerHTML="Fnet: ("+Math.round(b.fnet.x)+","+Math.round(b.fnet.y)+")  pos:("+Math.round(b.p.x)+","+Math.round(b.p.y)+")  vel:("+Math.round(b.v.x)+","+Math.round(b.v.y)+")  accel:("+Math.round(b.a.x)+","+Math.round(b.a.y)+")   " +pixPerMeter+"px=1m";
        }
        
        function draw(){
            // draw ball
            context.clearRect(0,0,canvas.width,canvas.height);
            b.draw(canvas,context);
            // draw ground
            drawLine(context,-toWorldX(canvas.width),-toWorldX(canvas.width)*-.2+5,toWorldX(canvas.width),toWorldX(canvas.width)*-.2+5,"#000");
        }
        curCanvas=canvas;
        running=true;
        function main(){
            var now = Date.now();
            var delta = now - then;
            update(delta/1000);
            draw();
            then = now;
            
            if (running){
                requestAnimationFrame(main);
            }
        }

        requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

        var then = Date.now();
        main();
    });
}