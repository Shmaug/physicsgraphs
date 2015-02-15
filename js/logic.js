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
});