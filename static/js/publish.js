//publish.js

$(document).ready(function(){
    $('#publish-btn').css('background-color', 'white');
    $('#video-preview').css('display', 'none');
    initInfo();
});

function initInfo(){
    $("#user-img").attr("src", 'img/' + window['localStorage'].imageUrl);
    $("#user-img").css("opacity", "1");
    $("#user-name").html('<strong class="font-bold">' + window['localStorage'].username + '</strong>');
}

const imagePostfix = [ ".jpg", ".jpeg", ".bmp", ".png", ".gif", ".tiff" ];
const videoPostfix = [".mp4", ".mkv", ".m4v"];

let publishVue = new Vue({
    el: '#publish-form',
    data: {
        title: '',
        content: '',
        fileType: '',
        file: '',
        filePath: '',
        apiUrl: '/upload'
    },
    mounted: function () {
        let defaultImagePath = $("#picker").attr('src');
        $('#picker').click(function () {
            $('#updater').trigger("click");
        });
        $('#updater').change(function () {
            $('#video-preview').css('display', 'none');
            $("#picker").attr('src', defaultImagePath);
            var $file = $(this);
            var fileObj = $file[0];
            publishVue.fileType = "";
            publishVue.file = "";
            publishVue.filepath = '';
            if(fileObj && fileObj.files && fileObj.files[0]){
                let path = $('#updater').val();
                let type = path.slice(path.lastIndexOf('.')).toLowerCase();
                if(imagePostfix.indexOf(type) !== -1 || videoPostfix.indexOf(type) !== -1){
                    let file = $("#updater")[0].files[0];
                    if (imagePostfix.indexOf(type) !== -1 )
                        $("#picker").attr('src', window.URL.createObjectURL(file));
                    else if (videoPostfix.indexOf(type) !== -1) {
                        $('#video-preview').css('display', 'block').attr('src', window.URL.createObjectURL(file));
                    }
                    publishVue.filePath = path;
                    publishVue.fileType = type;
                    publishVue.file = file;
                }else{
                    myAlert('Fatal Error', `<br>${type} format file is not supported!`);
                }
            }
        })
    },
    methods: {
        submit: function () {
            if (this.title.length === 0 || this.content.length === 0) {
                myAlert('Upload Error', "Title or content of the post is incomplete.");
                return;
            }
            let isImage = imagePostfix.indexOf(this.fileType) !== -1;
            let isVideo = videoPostfix.indexOf(this.fileType) !== -1;
            let uploadParam = `?title=${this.title}&content=${this.content}&imageType=${isImage?this.fileType:""}&mediaType=${isVideo?this.fileType:""}`;
            this.$http.post(this.apiUrl + uploadParam, this.file, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            }).then(function (response) {
                if (response.body.code === 0) {
                    myAlert("Upload Error", response.body.errMessage);
                    return;
                }
                window.location.href = '/index';
            })
        },
        clear: function () {
            this.title = '';
            this.content = '';
            this.file = '';
            this.fileType = '';
            this.filePath = '';
            $('#video-preview').css('display', 'none');
            $("#picker").attr('src', defaultImagePath);
        }
    }
});