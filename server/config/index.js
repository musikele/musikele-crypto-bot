let formatter = new Intl.NumberFormat('it', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

module.exports = {
  formatter
};