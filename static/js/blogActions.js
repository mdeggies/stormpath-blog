$(document).ready(init);

function init() {
  console.log('in blogActions.js');
}

function deletePost(index) {
  $.ajax({
    url: '/api/delete/'+index,
    type: 'DELETE',
    success: function(result) {
      $('#table tr').filter(':has(:checkbox:checked)').remove();
    }
  });
}
