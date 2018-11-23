const express = require('express');
var morgan = require('morgan')

const CryptoService = require('./crypto_service');


const app = express();

app.use(express.static(__dirname + '/../client/'));

app.use(morgan('tiny'));

app.get('/api', async (req, res) => {
  try {
    const result = await CryptoService.getCryptoTotal();
    res.send(result);
  }
  catch(e) {
    res.status(500).send('error!');
  }
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Application started on port ${PORT}`);
})
