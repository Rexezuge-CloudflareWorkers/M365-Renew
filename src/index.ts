import { AbstractWorker, M365RenewWorker } from '@/workers';
import { Env } from '@/interfaces';

const worker: AbstractWorker = new M365RenewWorker();

export default {
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => worker.fetch(req, env, ctx),
  scheduled: (event: ScheduledController, env: Env, ctx: ExecutionContext) => worker.scheduled(event, env, ctx),
} satisfies ExportedHandler<Env>;
