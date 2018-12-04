//make connection
var csocket =io.connect('localhost:3000');
var $username;
var $avatar;
var $error = $('#error')
$(document).ready(function(){
  $('#chatWindow').hide();
    $("#message").emojioneArea();
});

$('#send').click(function(e){
  e.preventDefault();
  csocket.emit('send message', $('.emojionearea-editor').html());
  $("#message").remove();
  $('.emojionearea-editor').empty();

});

//listen for all events
csocket.on('new message', function(data){
  var d = new Date();
  $('#output').prepend('<img class="avatar" src='+data.avatar+'><strong> '+data.user+':</strong><span class="well well-sm"> '+data.msg+'</span><small class="pull-right">'+ d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })+'</small><br><br>')
      $('#feedback').empty();
})

//userform
$('.avatarform').click(function(e){
  e.preventDefault();
  $avatar = $(this).attr("value");
  console.log($avatar)
  $username = $('#username').val();
  csocket.emit('new user', {user:$username,avatar:$avatar}, function(data){
    if(data){
        $('#loginform').hide();
        $('#chatWindow').show();
    }else{
      $error.html('Username is already taken')
    }
  })
  $('#username').val('')
});

csocket.on('usernames', function(data){
  var html = ' ';
  for(i=0; i<data.usernames.length; i++){
    html +="<img class='avatar' src="+data.avatars[i]+"> <span> "+data.usernames[i] +'</span> <br><br>'
  }
  $('#user-window').html(html);
})


$('.panel-footer').keypress(function(){
  csocket.emit('typing', $username);
})

$('.panel-footer').change( function(){
  csocket.emit('not typing',$username);
})


csocket.on('typing', function(data){
  $('#feedback').html('<p><em>'+data+' is typing message  ...</em></p>');
});

csocket.on('not typing', function(data){
  $('#feedback').empty();
})
