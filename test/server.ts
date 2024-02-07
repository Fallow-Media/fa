import { Application, Context, Router } from "https://deno.land/x/oak@v13.0.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const staticFiles = async (ctx: Context, next: () => Promise<unknown>) => {
    const prefix = '/lib'; // Sub-path to react on
    if (ctx.request.url.pathname.startsWith(prefix)) {
      await ctx.send({
        root: `${Deno.cwd()}/lib/`, // Local directory to serve from
        path: ctx.request.url.pathname.replace(prefix, ''), // Map to target path
      });
    } else {
      await next();
    }
  };

const createSessionID = async (ip: string) => {
  const salt: string = await bcrypt.genSalt(8);
  const hash: string = await bcrypt.hash(ip, salt);
  return hash;
}


const db = new DB("./testdb.sqlite");
db.execute(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionID TEXT,
    url TEXT,
    referrer TEXT,
    time INTEGER
  )
`);

const router = new Router();

router.get("/", async (ctx: Context) => {
  ctx.response.body = await Deno.open("./index.html", { read: true });
});

router.get("/stats", async (ctx: Context) => {
  let stats = db.transaction(() => {
    try {
      return db.query("SELECT * FROM stats;");
    } catch (error) {
      console.error(error);
      return error;
    }
  });
  ctx.response.body = stats;
});

router.post("/", async (ctx: Context) => {
    const body = await ctx.request.body.json();

    const sessionID: string = body.fa_sid ? body.fa_sid : (await createSessionID(ctx.request.ip));

    const dataObject = {
      url: body.url,
      sessionID: sessionID,
      referrer: body.ref,
      time: body.time
    };

    // Store the info in the db.
    db.transaction(() => {
      try {
        db.query<[string, string, string, number]>(
          "INSERT INTO stats (url, sessionID, referrer, time) VALUES (:url, :sessionID, :referrer, :time);",
          dataObject,
         );
      } catch (error) {
        console.error(error);
      }
    });

    if (body.fa_sid) {
      ctx.response.body = JSON.stringify({});
    } else {
      ctx.response.body = JSON.stringify(dataObject);
    }
});

const app = new Application();

app.use(staticFiles);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 5001 });
console.log("Listening: 5001");