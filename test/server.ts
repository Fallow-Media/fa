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

const createSessionID = async (ip: string, salt: string) => await bcrypt.hash(ip, salt);


const db = new DB("./testdb.sqlite");

db.execute(`
  CREATE TABLE IF NOT EXISTS stats (
    sessionID TEXT,
    url TEXT,
    referrer TEXT,
    time INTEGER
  )
`);

db.execute(`
    CREATE TABLE IF NOT EXISTS salts (
      salt TEXT,
      expires INTEGER
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

router.get("/stats/salt", async (ctx: Context) => {
  let salts = db.transaction(() => {
    try {
      return db.query("SELECT * FROM salts;");
    } catch (error) {
      console.error(error);
      return error;
    }
  });
  if (salts.length > 0) {
    ctx.response.body = salts[0];
  } else {
    return null;
  }
});


const getSalt = async () => {
  
  const valid_for = 1000 * 60 * 60 * 24;

  const is_expired = (current_time: number, expired_time: number, valid_for: number) => {
    return current_time - valid_for > expired_time ? true : false;
  };

  let saltQuery = db.transaction(() => {
    try {
      return db.queryEntries("SELECT * FROM salts;");
    } catch (error) {
      console.error(error);
      return error;
    }
  });

  const createNewSalt = async (expires = Date.now()) => {
    let new_salt: string = await bcrypt.genSalt(8);
    let new_expiry_time: number = expires + valid_for;
    console.log(new_expiry_time);
    return {salt: new_salt, expires: new_expiry_time};
  }

  const updateSalt = (new_salt) => {
    const newSaltQuery = db.prepareQuery(
      "INSERT INTO salts (salt, expires) VALUES (:salt, :expires)",
    );
    try {
      db.query("DELETE FROM salts");
      newSaltQuery.execute({
        salt: new_salt.salt,
        expires: new_salt.expires
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (!saltQuery[0]) {
    let new_salt = await createNewSalt();
    updateSalt(new_salt);
    return new_salt.salt;
  }
  
  if (is_expired(Date.now(), saltQuery[0].expires, valid_for)) {
    let new_salt = await createNewSalt(saltQuery[0].expires);
    updateSalt(new_salt);
    return new_salt.salt;
  } else {
    return saltQuery[0].salt;
  }

};

router.post("/", async (ctx: Context) => {
    const body = await ctx.request.body.json();

    const salt = await getSalt();

    const sessionID: string = await createSessionID(ctx.request.ip, salt);

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

    ctx.response.body = true;
});

const app = new Application();

app.use(staticFiles);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 5001 });
console.log("Listening: 5001");