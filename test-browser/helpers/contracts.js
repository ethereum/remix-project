module.exports = {
  checkCompiledContracts: function (browser, compiled, callback) {
    browser.execute(function () {
      var contracts = document.querySelectorAll('.udapp .contract');
      var ret = [];
      for (var k in contracts) {
        var el = contracts[k];
        if (el.querySelector) {
          ret.push({
            name: el.querySelector('.title').innerText.replace(el.querySelector('.size').innerText, '').replace(/(\t)|(\r)|(\n)/g, '') // IE/firefox add \r\n
          });
        }
      }
      return ret;
    }, [''], function (result) {
      browser.assert.equal(result.value.length, compiled.length);
      result.value.map(function (item, i) {
        browser.assert.equal(item.name, compiled[i]);
      });
      callback();
    });
  }
};
