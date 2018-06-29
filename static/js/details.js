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
	initInfo();
	postVue.initPost();
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

let vueUserInfo = new Vue({
    el: 'body'
});
const getInfoAPI = "/getUserInfo";
function initInfo(){
    vueUserInfo.$http.post(getInfoAPI).then(function (response) {
        if(response.body.code === 1){
            var body = response.body;
            $("#user-img").attr("src", 'img/' + body.imageUrl);
            window['localStorage'].imageUrl = body.imageUrl;
            window['localStorage'].username = body.username;
            $("#user-img").css("opacity", "1");
            $("#user-name").html('<strong class="font-bold">' + body.username + '</strong>');
        }
    });
}

const postAPI = '/data';
const checkThumbAPI = '/checkThumb';
const thumbUpAPI = '/thumbUp';
const thumbDowmAPI = '/thumbDown';
const staticPath = 'img/';
const userInfoAPI = '/getUserInfo';
const postCommentAPI = '/commentUp';

let postVue = new Vue({
	el: '#Post-Area',
	data: {
		title: '',
		content: '',
		editor: '',
		comments: [],
		isImage: false,
		isVideo: false,
		fileUrl: '',
		postID: 0,
		thumbs: 0,
		format: "",
		commentEditor: ""
	},
	methods: {
		initPost: function () {
			this.postID = parseInt(window.location.href.slice(window.location.href.lastIndexOf("=")+1));
			if (isNaN(this.postID)) {
				window.location.href = 'index';
				return;
			}
			let getParam = {id: this.postID};
			this.$http.post(postAPI, getParam).then(async function (response) {
				if (response.body.code === 0) {
					myAlert("Error", response.body.errMessage);
					return;
				}
				else if (response.body.code === 1) {
					this.editor = response.body.editor;
					this.title = response.body.title;
					this.content = response.body.content;
					let comments = response.body.comments;
					for (let i in comments) {
						let comment = {
							poster: Object.keys(comments[i])[0],
							content: Object.values(comments[i])[0]
						};
						await postVue.$http.post(userInfoAPI, {name: comment.poster, flag: true}).then(function (response) {
							if (response.body.code === 0) {
								myAlert("Error Retrieving User Info", response.body.errMessage);
								return;
							}
							else if (response.body.code === 1) {
								comment.userThumbnailURL = staticPath + response.body.imageUrl;
							}
                        });
						this.comments.push(comment);
					}
					if (response.body.image.length !== 0) {
						this.isImage = true;
						this.fileUrl = staticPath + response.body.image;
					}
					else if (response.body.media.length !== 0) {
                        this.isVideo = true;
                        this.fileUrl = staticPath + response.body.media;
					}
					this.thumbs = response.body.thumbs;
					this.format = this.isVideo ? "Video" : this.isImage ? "Image" : "Article";
				}
            })
        },
        giveThumb: function () {
			this.$http.post(checkThumbAPI, {id: this.postID}).then(function (response) {
				if (response.body.haveThumb === 1) {
					postVue.$http.post(thumbDowmAPI, {postID: postVue.postID}).then(function (response) {
						if (response.body.code === 1) {
							postVue.thumbs -= 1;
						}
						else {
							myAlert("Error", response.body.errMessage);
						}
                    });
				}
				else if (response.body.haveThumb === 0) {
                    postVue.$http.post(thumbUpAPI, {postID: postVue.postID}).then(function (response) {
                        if (response.body.code === 1) {
                            postVue.thumbs += 1;
                        }
                        else {
                            myAlert("Error", response.body.errMessage);
                        }
                    });
				}
            })
        },
		sendComment: function () {
			this.$http.post(postCommentAPI, {postID: this.postID, content: this.commentEditor}).then(function (response) {
				if (response.body.code === 0) {
					myAlert("Comment Posting Error", response.body.errMessage);
					return;
				}
				else if (response.body.code === 1) {
					postVue.$http.post(userInfoAPI)
				}
            })
        }
	}
});