import { createServer } from 'http';
import { M365RenewWorker } from '@/workers';

const worker = new M365RenewWorker();
const port = process.env.PORT || 3000;

const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as unknown as BodyInit) : null,
    duplex: 'half',
  } as RequestInit);

  try {
    const response = await worker.fetch(request, process.env as unknown as Env, {} as ExecutionContext);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  } catch {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
