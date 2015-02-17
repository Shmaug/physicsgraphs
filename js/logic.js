$(".content").load("in.html");
var curColor=0;

function waitForElement(e){
    if (document.getElementById(e)){
        return;
    }else{
        setTimeout(function(){waitForElement(e);},250);
    }
}

$(window).load(function(){
    // subtitles should show/hide on click
    $("h2").each(function(i){
        $(this).click(function(){
            var h=36;
            if ($(this).parent().parent().height() <= 36){
                h=$(this).parent().height();
            }
            $(this).parent().parent().animate({height:h+"px"},500);
        });
    });
    var busy=true;
    // slide down first div
    var v=$(".content").css("margin-top");
    $(".content").css("margin-top", "-100%");
    $(".content").animate({"margin-top":v},1500,function(){busy=false;});
    
    // slides down index page
    $(document).on("click","a.hbtn",function(e){
        if (busy){
            return;
        }
        busy=true;
        var val=$(".content").css("margin-top");
        $(".kbtn").css("text-decoration","none");
        $(".rbtn").css("text-decoration","none");
        $(".ebtn").css("text-decoration","none");
        $(".header").animate({backgroundColor:"#16a085"},1500);
        $(".navdiv").animate({backgroundColor:"#1abc9c"},1500);
        $(".content").animate({"margin-top":"-100%"},750,"",function(){
            $(".content").css("background-color","#1abc9c");
            $(".content").load("in.html");
            $(".content").animate({"margin-top":val},750,"",function(){busy=false;});
        });
    });
    // slides down kinematics page
    $(document).on("click","a.kbtn",function(e){
        if (busy){
            return;
        }
        busy=true;
        var val=$(".content").css("margin-top");
        $(this).css("text-decoration","underline");
        $(".rbtn").css("text-decoration","none");
        $(".ebtn").css("text-decoration","none");
        $(".header").animate({backgroundColor:"#2980b9"},1500);
        $(".navdiv").animate({backgroundColor:"#3498db"},1500);
        $(".content").animate({"margin-top":"-100%"},750,"",function(){
            $(".content").css("background-color","#3498db");
            $(".content").load("kinematics.html");
            $(".content").animate({"margin-top":val},750,"",function(){busy=false; loadKDemo();});
        });
    });
    // slides down rotation page
    $(document).on("click","a.rbtn",function(e){
        if (busy){
            return;
        }
        busy=true;
        var val=$(".content").css("margin-top");
        $(this).css("text-decoration","underline");
        $(".kbtn").css("text-decoration","none");
        $(".ebtn").css("text-decoration","none");
        $(".header").animate({backgroundColor:"#7f8c8d"},1500);
        $(".navdiv").animate({backgroundColor:"#95a5a6"},1500);
        $(".content").animate({"margin-top":"-100%"},750,"",function(){
            $(".content").css("background-color","#95a5a6");
            $(".content").load("rotation.html");
            $(".content").animate({"margin-top":val},750,"",function(){busy=false;});
        });
    });
    // slides down energy page
    $(document).on("click","a.ebtn",function(e){
        if (window.busy){
            return;
        }
        busy=true;
        var val=$(".content").css("margin-top");
        $(this).css("text-decoration","underline");
        $(".kbtn").css("text-decoration","none");
        $(".rbtn").css("text-decoration","none");
        $(".header").animate({backgroundColor:"#27ae60"},1500);
        $(".navdiv").animate({backgroundColor:"#2ecc71"},1500);
        $(".content").animate({"margin-top":"-100%"},750,"",function(){
            $(".content").css("background-color","#2ecc71");
            $(".content").load("energy.html");
            $(".content").animate({"margin-top":val},750,"",function(){busy=false;});
        });
    });
});