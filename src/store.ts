import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface PingRow {
  id: number;
  at: number;
  subject: string;
  text: string;
  held: number;
  delivered: number;
}

export interface WakeupRow {
  id: number;
  at: number;
  subject: string;
  reason: string;
  fired: number;
}

const SCHEMA = `
create table if not exists kv (k text primary key, v text not null);
create table if not exists pings (
  id integer primary key, at integer not null, subject text not null, text text not null,
  held integer not null default 0, delivered integer not null default 0
);
create table if not exists wakeups (
  id integer primary key, at integer not null, subject text not null, reason text not null,
  fired integer not null default 0
);
`;

/** SQLite state that must survive a restart: pings, wakeups, sessions, seen GitHub ids. */
export class Store {
  private db: DatabaseSync;

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(SCHEMA);
  }

  get(key: string): string | undefined {
    const row = this.db.prepare('select v from kv where k = ?').get(key) as { v: string } | undefined;
    return row?.v;
  }

  set(key: string, value: string): void {
    this.db.prepare('insert into kv (k, v) values (?, ?) on conflict(k) do update set v = excluded.v').run(key, value);
  }

  addPing(at: number, subject: string, text: string, held: boolean): void {
    this.db.prepare('insert into pings (at, subject, text, held) values (?, ?, ?, ?)').run(at, subject, text, held ? 1 : 0);
  }

  recentPings(limit = 30): PingRow[] {
    return this.db.prepare('select * from pings order by id desc limit ?').all(limit) as unknown as PingRow[];
  }

  pingsSentOn(dayStart: number, dayEnd: number): number {
    const row = this.db
      .prepare('select count(*) as n from pings where held = 0 and at >= ? and at < ?')
      .get(dayStart, dayEnd) as { n: number };
    return row.n;
  }

  /** Held pings not yet delivered in a digest; marks them delivered. */
  takeHeld(): PingRow[] {
    const rows = this.db.prepare('select * from pings where held = 1 and delivered = 0 order by id').all() as unknown as PingRow[];
    this.db.prepare('update pings set delivered = 1 where held = 1 and delivered = 0').run();
    return rows;
  }

  addWakeup(at: number, subject: string, reason: string): void {
    this.db.prepare('insert into wakeups (at, subject, reason) values (?, ?, ?)').run(at, subject, reason);
  }

  takeDueWakeups(now: number): WakeupRow[] {
    const rows = this.db.prepare('select * from wakeups where fired = 0 and at <= ? order by at').all(now) as unknown as WakeupRow[];
    this.db.prepare('update wakeups set fired = 1 where fired = 0 and at <= ?').run(now);
    return rows;
  }

  pendingWakeups(): WakeupRow[] {
    return this.db.prepare('select * from wakeups where fired = 0 order by at').all() as unknown as WakeupRow[];
  }

  reset(): void {
    this.db.exec('delete from kv; delete from pings; delete from wakeups;');
  }
}
