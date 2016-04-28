'use strict';

$(document).ready();

function deletePost(username, index) {
  $.ajax({
    url: '/bloggers/'+username+'/delete/'+index,
    type: 'DELETE',
    success: function(result) {
      $('#table tr').filter(':has(:checkbox:checked)').remove();
    }
  });
}
