const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const PROPERTY_ID = '377208825';
const CREDENTIALS_PATH = './ga-credentials.json';

const client = new BetaAnalyticsDataClient({
  keyFilename: CREDENTIALS_PATH,
});

async function query(options = {}) {
  const {
    startDate = '30daysAgo',
    endDate = 'today',
    dimensions = ['date'],
    metrics = ['sessions', 'totalUsers', 'screenPageViews'],
  } = options;

  const [response] = await client.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: dimensions.map(d => ({ name: d })),
    metrics: metrics.map(m => ({ name: m })),
  });

  const headers = [
    ...response.dimensionHeaders.map(h => h.name),
    ...response.metricHeaders.map(h => h.name),
  ];

  const rows = response.rows.map(row => [
    ...row.dimensionValues.map(v => v.value),
    ...row.metricValues.map(v => v.value),
  ]);

  return { headers, rows };
}

// Run if called directly with a preset report
async function main() {
  const report = process.argv[2] || 'overview';

  const reports = {
    overview: {
      startDate: '30daysAgo',
      dimensions: ['date'],
      metrics: ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
    },
    pages: {
      startDate: '30daysAgo',
      dimensions: ['pagePath'],
      metrics: ['screenPageViews', 'totalUsers', 'averageSessionDuration'],
    },
    sources: {
      startDate: '30daysAgo',
      dimensions: ['sessionSource', 'sessionMedium'],
      metrics: ['sessions', 'totalUsers', 'screenPageViews'],
    },
    countries: {
      startDate: '30daysAgo',
      dimensions: ['country'],
      metrics: ['sessions', 'totalUsers'],
    },
    devices: {
      startDate: '30daysAgo',
      dimensions: ['deviceCategory'],
      metrics: ['sessions', 'totalUsers', 'screenPageViews'],
    },
    languages: {
      startDate: '30daysAgo',
      dimensions: ['language'],
      metrics: ['sessions', 'totalUsers'],
    },
  };

  const config = reports[report];
  if (!config) {
    console.error(`Unknown report: ${report}`);
    console.error(`Available: ${Object.keys(reports).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== ${report.toUpperCase()} (last 30 days) ===\n`);

  const { headers, rows } = await query(config);

  // Print as table
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  );

  console.log(headers.map((h, i) => h.padEnd(colWidths[i])).join('  '));
  console.log(colWidths.map(w => '-'.repeat(w)).join('  '));
  rows.forEach(row => {
    console.log(row.map((v, i) => v.padEnd(colWidths[i])).join('  '));
  });

  console.log(`\n${rows.length} rows`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
