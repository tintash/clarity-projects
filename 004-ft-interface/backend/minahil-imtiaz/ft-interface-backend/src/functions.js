function displayTokenInformation(data) {
  $("#token-name").append(data.tokenName);
  $("#token-symbol").append(data.tokenSymbol);
  $("#total-supply").append(data.tokenSupply);
}

function onTokenInformationFailure() {
  console.log("Couldn't get token information");
}

$(document).ready(function () {
  $.post('/', function () {})
    .done(displayTokenInformation)
    .fail(onTokenInformationFailure);
});
