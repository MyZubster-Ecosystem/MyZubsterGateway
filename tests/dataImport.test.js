const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCsv, parseJson, normalizePayload } = require('../routes/dataImportRoutes')._test;

test('parseCsv parses headers, rows and quoted commas', () => {
  const rows = parseCsv('site,parameter,value\nFerrara,pH,7.4\n"Rimini, north",temperature,22.1');

  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], { site: 'Ferrara', parameter: 'pH', value: '7.4' });
  assert.deepEqual(rows[1], {
    site: 'Rimini, north',
    parameter: 'temperature',
    value: '22.1',
  });
});

test('parseCsv rejects duplicate headers', () => {
  assert.throws(() => parseCsv('site,site\nA,B'), /duplicate headers/);
});

test('parseJson accepts an array or records wrapper', () => {
  assert.deepEqual(parseJson('[{"value":1}]'), [{ value: 1 }]);
  assert.deepEqual(parseJson({ records: [{ value: 2 }] }), [{ value: 2 }]);
});

test('normalizePayload returns a stable digest and schema preview metadata', () => {
  const input = {
    format: 'json',
    datasetType: 'water-quality',
    source: 'Terra&AcquaTech pilot',
    data: [
      { station: 'A', ph: 7.2, temperature: 20.1 },
      { station: 'B', ph: 7.4, temperature: 20.3 },
    ],
  };

  const first = normalizePayload(input);
  const second = normalizePayload(input);

  assert.equal(first.records.length, 2);
  assert.deepEqual(first.schemaFields, ['ph', 'station', 'temperature']);
  assert.equal(first.digest, second.digest);
  assert.match(first.digest, /^[a-f0-9]{64}$/);
});

test('normalizePayload rejects unsupported formats and empty datasets', () => {
  assert.throws(
    () => normalizePayload({ format: 'xlsx', datasetType: 'water', source: 'pilot', data: [] }),
    /format must be csv or json/
  );

  assert.throws(
    () => normalizePayload({ format: 'json', datasetType: 'water', source: 'pilot', data: [] }),
    /No records found/
  );
});
