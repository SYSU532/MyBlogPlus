// Details.js

$(document).ready(function(){
	// Initializes and creates emoji set from sprite sheet
	window.emojiPicker = new EmojiPicker({
		emojiable_selector: '[data-emojiable=true]',
		assetsPath: '../img/',
		popupButtonClasses: 'fa fa-smile-o'
	});
	// Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
	// You may want to delay this step if you have dynamically created input fields that appear later in the loading process
	// It can be called as many times as necessary; previously converted input fields will not be converted again
	window.emojiPicker.discover();
	var commit = $("#send-commit");
	commit.click(onCommentUp);
});

function onCommentUp(){
	var text = $("#send-comment").val();
	var target = $(".comments-block");
	if(text == ''){
		myAlert('Fatal Warning', '<br>Cannot update empty comment!!');
	}else{
		var div1 = '<div class="comments-item" style="display:none;"><img class="img-circle" alt="img" src="img/follower.jpg" style="height:60px;width:60px;"></img>';
		var div2 = '<span class="details-words">Follower 1 : &nbsp;&nbsp;&nbsp;&nbsp;' + text + '</span></div>';
		var newChild = div1 + div2;
		target.append(newChild);
		var lastChild = $(".comments-block").children().eq(-1);
		lastChild.fadeIn();
	}
}
