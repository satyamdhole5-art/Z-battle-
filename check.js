async function test() {
  try {
    const r = await fetch('http://localhost:3000/download');
    console.log('Status:', r.status);
    const text = await r.text();
    console.log('Body text length:', text.length);
    console.log('Body:', text.substring(0, 500));
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
