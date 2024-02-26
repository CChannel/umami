/* eslint-disable no-console */
// const { Resolver } = require('dns').promises;
// import isbot from 'isbot';
import { secret, uuid } from 'lib/crypto';
import { useCors, useSession } from 'lib/middleware';
import { getJsonBody } from 'lib/request';
import { badRequest, createToken, send } from 'next-basics';
import { saveEvent, savePageView } from 'queries';

export default async (req, res) => {
  await useCors(req, res);

  // if (isbot(req.headers['user-agent']) && !process.env.DISABLE_BOT_CHECK) {
  //   return unauthorized(res);
  // }

  // const ignoreIps = process.env.IGNORE_IP;
  // const ignoreHostnames = process.env.IGNORE_HOSTNAME;

  // if (ignoreIps || ignoreHostnames) {
  //   const ips = [];

  //   if (ignoreIps) {
  //     ips.push(...ignoreIps.split(',').map(n => n.trim()));
  //   }

  //   if (ignoreHostnames) {
  //     const resolver = new Resolver();
  //     const promises = ignoreHostnames
  //       .split(',')
  //       .map(n => resolver.resolve4(n.trim()).catch(() => {}));

  //     await Promise.all(promises).then(resolvedIps => {
  //       ips.push(...resolvedIps.filter(n => n).flatMap(n => n));
  //     });
  //   }

  //   const clientIp = getIpAddress(req);

  //   const blocked = ips.find(ip => {
  //     console.log('collect.js', ip, clientIp);
  //     if (ip === clientIp) return true;

  //     // CIDR notation
  //     if (ip.indexOf('/') > 0) {
  //       const addr = ipaddr.parse(clientIp);
  //       const range = ipaddr.parseCIDR(ip);

  //       if (addr.kind() === range[0].kind() && addr.match(range)) return true;
  //     }

  //     return false;
  //   });

  //   if (blocked) {
  //     return forbidden(res);
  //   }
  // }

  await useSession(req, res);

  const {
    session: { website_id, session_id, session_uuid, website_domain },
  } = req;

  const { type, payload } = getJsonBody(req);

  let { url, referrer, event_name, event_data, hostname } = payload;

  if (process.env.REMOVE_TRAILING_SLASH) {
    url = url.replace(/\/$/, '');
  }

  // Add hostname if it is not from the domain registered in umami
  // This will help to track session when users is redireced to different webpage
  // Example: https://hyacca.online/bridal/set/ -> https://mp.cac-app.com/v/cart3/gift/main/
  // Now umami collects this page as: url: bridal/set/ & url: v/cart3/gift/main/
  if (hostname !== website_domain) {
    url = `//${hostname}/${url}`;
  }

  const event_uuid = uuid();

  if (type === 'pageview') {
    await savePageView(website_id, { session_id, session_uuid, url, referrer });
  } else if (type === 'event') {
    await saveEvent(website_id, {
      event_uuid,
      session_id,
      session_uuid,
      url,
      event_name,
      event_data,
    });
  } else {
    return badRequest(res);
  }

  const token = createToken({ website_id, session_id, session_uuid }, secret());

  return send(res, token);
};
