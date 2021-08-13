/*Add to cart Start*/
function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
            else{
              location.href = "/login"
            }
        }

    })  
}
/*Add to cart End*/
/*Product Search in user-headers Start*/

//CODE FOR THE SEARCH RESULTS XHR


//CODE FOR THE SEARCH RESULTS XHR
var showResults = debounce(function (arg) {
  var value = arg.trim();
  if (value == "" || value.length <= 0) {
    $("#search-results").fadeOut();
    return;
  } else {
    $("#search-results").fadeIn();
  };
  var jquser = $.get('/search?q=' + value, function (data) {
      $("#search-results").html("");
    })
    .done(function (data) {
      if (data.length === 0) {
        $("#search-results").append('<p class="lead text-center mt-2">No results</p>');
      } else {
        console.table(data);
        $("#search-results").append('<p class="text-center m-0 lead">Products</p>');
        data.forEach(product=> {
        $("#search-results").append('<a href="" ><p class="m-2 mt-0 lead">' + product.Name + '</p> </a>');
/**hoi *//*
<script>
var val = 55;
</script>
</head>
<body>                 
  
Link to <a href="https://www.google.com/"
onclick="location.href=this.href+'?xyz='+val;return false;">
Google
</a>
/*hoi*/


        });
      }
    })
    .fail(function (err) {
      console.log(err);
    })
}, 300);


function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
/*Product Search in user-headers End*/