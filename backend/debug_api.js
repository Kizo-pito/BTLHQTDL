const http = require('http');

http.get('http://localhost:5000/api/tutors', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json.slice(0, 1), null, 2));
    } catch (e) {
        console.error('Lỗi parse JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Lỗi kết nối:', err.message);
});
