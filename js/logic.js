$(document).ready(function(){
    $("h2").each(function(i){
        $(this).click(function(){
            var h=36;
            if ($(this).parent().parent().height() <= 36){
                h=$(this).parent().height();
            }
            $(this).parent().parent().animate({height:h+"px"},500);
        });
    });
    $(".container").each(function(i){
        var c = document.createElement("canvas");
        c.width=$(this).width();
        c.height=$(this).height();
        this.appendChild(c);
        $(this).attr("data-ready","yes");
    });
    var val2=$(".content").css("margin-top");
    $(".content").css("margin-top", "-100%");
    $(".content").animate({"margin-top":val2},1500);
});