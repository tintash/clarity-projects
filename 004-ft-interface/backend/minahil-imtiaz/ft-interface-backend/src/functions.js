$(document).ready(function () {
  $.post('/', function (getTokenDetails) {})
    .done(function (data) {
      console.log(data);
      document.getElementById('token-name').innerHTML += data.tokenName;
      document.getElementById('token-symbol').innerHTML += data.tokenSymbol;
      document.getElementById('total-supply').innerHTML += data.tokenSupply;
    })
    .fail(function () {
      console.log("Couldn't get token information");
    });
});
