import { pool } from '../config/database';

type ClickEvent = {
  urlId: number;
};

const clickBuffer: ClickEvent[] = [];

const FLUSH_INTERVAL = 5000;
const MAX_BATCH_SIZE = 1000;

//Prevent multiple workers in dev
if (!(global as any).__clickWorkerStarted) {
  (global as any).__clickWorkerStarted = true;

  setInterval(() => {
    flushClicks().catch(console.error);
  }, FLUSH_INTERVAL);
}

export function enqueueClick(urlId: number) {
  clickBuffer.push({ urlId });
}

async function flushClicks() {
  if (clickBuffer.length === 0) return;

  const batch = clickBuffer.splice(0, MAX_BATCH_SIZE);

  const grouped: Record<number, number> = {};

  for (const click of batch) {
    grouped[click.urlId] = (grouped[click.urlId] || 0) + 1;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const [urlId, count] of Object.entries(grouped)) {
      await client.query(
        `
        UPDATE urls
        SET access_count = access_count + $1,
            last_accessed_at = NOW()
        WHERE id = $2
        `,
        [count, Number(urlId)]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Click flush failed:', err);
  } finally {
    client.release();
  }
}
