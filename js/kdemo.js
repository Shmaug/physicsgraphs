function loadKDemo(){
    $(document).ready(function(){
        $(".bar").css("width",pixPerMeter+"px");
        var fnetcontainer=$("#cfnet");
        
        var canvas = document.createElement("canvas");
        canvas.width=$(".container").width();
        canvas.height=$(".container").height();
        $(".container")[0].appendChild(canvas);
        
        var readout = fnetcontainer.children("#readout");
        var context = canvas.getContext("2d");
        
        var b=new ball(10,"img/dank.png");
        
        // set up input
        initCanvas(fnetcontainer.children("canvas"));

        function update(time){
            b.setForces();
            
            // apply Fapp toward mouse if clicking
            if (mouseDown){
                var fa=-Math.atan2(mousePos.y-b.rp.y,mousePos.x-b.rp.x);
                var d=Math.min(dist(mousePos,b.rp)/pixPerMeter*2,20);
                var fx=Math.cos(fa)*b.mass*d;
                var fy=Math.sin(fa)*b.mass*d;
                b.forces.push(["#0f0","Fapp",{x:fx,y:fy}]);
            }
        
            b.applyForces(time, {width:canvas.width,height:canvas.height});
            
            readout[0].innerHTML="pos:("+Math.floor(b.p.x)+","+Math.floor(b.p.y)+")  vel:("+Math.floor(b.v.x)+","+Math.floor(b.v.y)+")  "+ "accel:("+Math.floor(b.a.x)+","+Math.floor(b.a.y)+")   " +pixPerMeter+"px=1m";
        }
        
        function draw(){
            // draw ball
            context.clearRect(0,0,canvas.width,canvas.height);
            b.draw(canvas,context);
        }

        function main(){
            var now = Date.now();
            var delta = now - then;
            update(delta/1000);
            draw();
            then = now;
            requestAnimationFrame(main);
        }

        requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

        var then = Date.now();
        main();
    });
}