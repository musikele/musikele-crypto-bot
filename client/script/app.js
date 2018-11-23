const vm = new Vue({
  el: '#app',
  data: {
    crypto: []
  },
  methods: {
    getData: async function() {
      console.log('calling server...');
      try {
        let resp = await fetch('/api');
        console.log(crypto.json());
      }
      catch(e) {
        throw e;
      }
    }
  }
})

vm.getData();