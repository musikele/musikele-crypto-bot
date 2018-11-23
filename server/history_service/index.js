const fs = require('fs');

const saveDataPoint = (formattedTotal) => {
  let date = new Date();
  let valueNow = {
    date: date.toLocaleString(),
    value: formattedTotal
  }
  let storicoFile = fs.readFileSync('storico.json').toString();
  storicoJSON = JSON.parse(storicoFile);
  storicoJSON.push(valueNow);
  fs.writeFileSync('storico.json', JSON.stringify(storicoJSON));
}

module.exports = {
  saveDataPoint
}