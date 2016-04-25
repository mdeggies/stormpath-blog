'use strict';

$(document).ready();

function deletePost(index) {
  $.ajax({
    url: '/api/delete/'+index,
    type: 'DELETE',
    success: function(result) {
      $('#table tr').filter(':has(:checkbox:checked)').remove();
    }
  });
}
