//search.js

$(document).ready(function(){
    $('#search-btn').css('background-color', 'white');
    $('#search-friend-btn').click(onSearch)
    $('#search').focus(focusSearch);
    $('#search').blur(blurSearch);
});

function focusSearch(){
    $('#search').attr('placeholder', '');
    $('#search').css('background-color', 'white');
}

function blurSearch(){
    $('#search').attr('placeholder', 'New Friend Name');
    $('#search').css('background-color', '#EEEEEE');
}

function onSearch(){
    var hasUser = true;
    var target = $('.search-result');
    // Send Search Request and Get result
    target.children().remove();
    if(hasUser){
        var div = '<div class="friends-row" style="width: 420px;cursor: pointer;">';
        var a = '<a class="dropdown-toggle" data-toggle="dropdown"></b></a>';
        var ul = '<ul class="dropdown-menu animated fadeInRight search-item"><li><a class="f-request">Send Friends Request</a></li></ul>';
        var child = $(div+'<img class="friends-img img-circle" src="img/follower.jpg"></img><span class="search-words">Follower 1</span>'+a+ul+'</div>');
        target.append(child);
    }else {
        // Alert No User
        myAlert('Search Result', 'Not Such User', function(){});
    }
    AddToggle();
    AddRequest();
}

function AddToggle(){
    $(".friends-row").click(function(){
        var target = $(".friends-row").children(".dropdown-menu");
        target.toggle();
    });
}

function AddRequest(){
    $(".f-request").click(function(){
        var resultName = 'Follower 1';
        myConfirm('Add Friend Request', 'Do you want to add<br>' + resultName + '<br>as your new friend?', function(){
            // Yes or Not
        })
    });
}