$(document).ready(function() {
  
    // Switch toggle
      $('.Switch.mark').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          console.log("1 switched");
      });
      
      $('.Switch.highlight').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          console.log("2 switched");
      });
      
      $('.Switch.word').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          console.log("3 switched");
      });
  
      $("#close").click(function(){
          //save to local Storage();
          
      $('.Switch.word').toggleClass('On').toggleClass('Off');
        //window.close();
      });
      
              
});
