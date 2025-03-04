import { v4, v5 } from 'uuid';
// import { startOfYear } from 'date-fns';
import { hash } from 'next-basics';

export function secret() {
  return hash(process.env.HASH_SALT || process.env.DATABASE_URL);
}

export function salt() {
  // const ROTATING_SALT = hash(startOfYear(new Date()).toUTCString());

  // return hash([secret(), ROTATING_SALT]);
  return hash([secret()]);
}

export function uuid(...args) {
  if (!args.length) return v4();

  return v5(hash([...args, salt()]), v5.DNS);
}
