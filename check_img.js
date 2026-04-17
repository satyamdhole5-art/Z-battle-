async function test() {
   const r = await fetch('https://dummyimage.com/192x192/ff6b00/000000.png&text=AP');
   console.log('Status:', r.status);
}
test();
