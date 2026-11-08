const fs = require('fs');
fs.mkdirSync('tests/fixtures', { recursive: true });

// 1. Thando 62 rows
const thandoKey = [
  '2026-08-25,SALARY ACME MEDIA,19800.00',
  '2026-09-25,SALARY ACME MEDIA,19800.00',
  '2026-10-24,SALARY ACME MEDIA,19800.00',
  '2026-09-01,FITZONE GYM DEBIT,-399.00',
  '2026-10-01,FITZONE GYM DEBIT,-399.00',
  '2026-10-02,FITZONE GYM DEBIT,-399.00',
  '2026-08-12,PREPAID ELECTRICITY,-350.00',
  '2026-09-14,PREPAID ELECTRICITY,-380.00',
  '2026-10-18,PREPAID ELECTRICITY,-1150.00',
  '2026-10-21,ONLINE TECH STORE,-2499.00'
];

// 52 ordinary rows: spread between 2026-08-10 and 2026-10-28
const payees = [
  ['WOOLWORTHS FOOD', -210.50],
  ['CHECKERS HYPER', -450.00],
  ['UBER TRIP', -85.00],
  ['SHELL SERVICE STATION', -350.00],
  ['DIS-CHEM PHARMACY', -180.00],
  ['NETFLIX SA', -199.00],
  ['VODACOM RECHARGE', -150.00],
  ['VIDA E CAFFE', -48.00],
  ['CLICKS STORE', -120.00],
  ['SEATTLE COFFEE CO', -45.00],
  ['MCDONALDS ROSEBANK', -95.00],
  ['KAUAI HEALTH', -88.00],
  ['MUGG AND BEAN', -145.00]
];

const ordinaryThando = [];
let day = 10;
let month = 8;
for (let i = 0; i < 52; i++) {
  const p = payees[i % payees.length];
  const dStr = '2026-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  ordinaryThando.push(dStr + ',' + p[0] + ',' + p[1]);
  day++;
  if (month === 8 && day > 31) { month = 9; day = 1; }
  else if (month === 9 && day > 30) { month = 10; day = 1; }
  else if (month === 10 && day > 28) { day = 15; }
}

const thandoRows = ['date,description,amount', ...thandoKey, ...ordinaryThando];
fs.writeFileSync('tests/fixtures/thando-oct.csv', thandoRows.join('\n'), 'utf8');

// 2. Sibusiso 40 rows
const sibusisoKey = [
  '2026-08-25,SALARY LOGISTIX DC,24500.00',
  '2026-09-25,SALARY LOGISTIX DC,24500.00',
  '2026-10-23,SALARY LOGISTIX DC,24500.00',
  '2026-10-03,FAMILYCARE FUNERAL PLAN,-250.00',
  '2026-10-05,FAMILYCARE FUNERAL PLAN,-250.00'
];

const ordinarySibusiso = [];
day = 12;
month = 8;
for (let i = 0; i < 35; i++) {
  const p = payees[i % payees.length];
  const dStr = '2026-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  ordinarySibusiso.push(dStr + ',' + p[0] + ',' + p[1]);
  day += 2;
  if (month === 8 && day > 31) { month = 9; day = 2; }
  else if (month === 9 && day > 30) { month = 10; day = 2; }
  else if (month === 10 && day > 27) { day = 10; }
}

const sibusisoRows = ['date,description,amount', ...sibusisoKey, ...ordinarySibusiso];
fs.writeFileSync('tests/fixtures/sibusiso.csv', sibusisoRows.join('\n'), 'utf8');

// 3. bad-header.csv
fs.writeFileSync('tests/fixtures/bad-header.csv', 'tx_date,tx_desc,tx_amount\n2026-10-01,Test,-100.00', 'utf8');

// 4. old-rows.csv (52 good rows, 10 old rows > 90 days ago)
const oldRows = ['date,description,amount'];
for (let i = 1; i <= 10; i++) {
  oldRows.push('2026-01-0' + i + ',VERY OLD ROW,-50.00');
}
for (let i = 0; i < 52; i++) {
  oldRows.push(ordinaryThando[i]);
}
fs.writeFileSync('tests/fixtures/old-rows.csv', oldRows.join('\n'), 'utf8');

// 5. too-big.csv (> 500 rows)
const tooBig = ['date,description,amount'];
for (let i = 0; i < 505; i++) {
  tooBig.push('2026-10-15,ROW ' + i + ',-10.00');
}
fs.writeFileSync('tests/fixtures/too-big.csv', tooBig.join('\n'), 'utf8');

// 6. sample.xlsx
fs.writeFileSync('tests/fixtures/sample.xlsx', 'PK\x03\x04[fake-zip-header-for-xlsx]', 'utf8');

// 7. public/creditwise-template.csv
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/creditwise-template.csv', 'date,description,amount\n2026-10-25,SALARY DEPOSIT,20000.00\n2026-10-26,GROCERIES CHECKERS,-450.00\n', 'utf8');

console.log('Fixtures generated successfully.');
