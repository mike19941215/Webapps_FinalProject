/*Create rule object*/
var rule = new rule();

$('#start').click(function(){
    rule.restart();
    $('#canvas').on('mousedown', function(e){
        rule.checkchess(e);
    });
});

$('#restart').click(function() {
    if(confirm("是否重新開始")){
        rule.restart();
    }
});

$('#regret').click(function() {
    rule.regret();
});

$('#back').click(function() {
    if(confirm("是否直接結束此局")){
        rule.backer();
        $('#canvas').off('mousedown');
        history.back();
    }
});

$('#step_ok').click(function(){
    if($('#timeset').prop('checked')){
        var min = $('#step_minute').val();
        var sec = $('#step_second').val();
        rule.timesetting(min,sec);
    }else{
        rule.timesetting(0,0);
    }
    rule.boardset($('#board_size').val());
    history.back();
});

$('#back1').click(function() {
    history.back();
});