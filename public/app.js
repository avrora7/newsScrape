$(document).on("click", ".close", function() {
    var noteId = $(this).attr("data-id");
    var articleId = $(this).attr("data-parent");

    $.ajax({
        method: "DELETE",
        url: "/articles/" + articleId + "/" + noteId,
        success: function (data, text) {
          location.reload();
        },
        error: function (request, status, error) {
        } 
      })
});

$(document).on("click", ".addNoteButton", function() {
    
    var thisId = $(this).attr("data-id");
    var noteTitle = $("#title_" + thisId).val().trim();
    var noteBody = $("#body_" + thisId).val().trim();
    if (noteTitle == "" || noteBody == "") {
        return;
    }

    var d = {
        title: noteTitle,
        body: noteBody
      }
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data:d,
      success: function (data, text) {
        location.reload();
      },
      error: function (request, status, error) {
      } 
    })
});