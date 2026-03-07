import https from 'https';

https.get('https://biohacker.minmaxmuscle.com/', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', () => {});
  res.on('end', () => console.log('Successfully reached the site.'));
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
