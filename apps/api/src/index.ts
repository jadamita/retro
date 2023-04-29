import { createServer } from "./server";
import { log } from "logger";
import { MongoClient, ServerApiVersion } from "mongodb";

const client = new MongoClient(process.env.DB_URL as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const port = process.env.PORT || 5001;
const server = createServer();
const http = require("http").Server(server);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

interface Card {
  id: string;
  x: number;
  y: number;
  color: string;
  content: string;
}

const db = client.db("retrodb");
const cards = db.collection<Card>("cards");

io.on("connection", async (socket: any) => {
  var address = socket.handshake.address;
  console.log(`⚡: ${socket.id} user just connected!`);
  const items: object[] = await cards.find({}).toArray();

  io.emit("BOX_LIST", items);
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
  socket.on("NEW_BOX", async (args: any) => {
    log(
      `🎉 New Box! ID: ${args.id} (${args.x}, ${args.y}) Color: ${args.color}`
    );
    const newCard = {
      id: args.id,
      x: args.x,
      y: args.y,
      color: args.color,
      content: args.content,
    };

    await cards.insertOne(newCard);

    const items: object[] = await cards.find({}).toArray();

    io.emit("BOX_LIST", items);
  });
  socket.on("REMOVE_BOX", async (args: any) => {
    await cards.deleteOne({ id: args.id });

    const items: object[] = await cards.find({}).toArray();

    io.emit("BOX_LIST", items);
  });
  socket.on("COLOR_BOX", async (args: any) => {
    await cards.updateOne(
      { id: args.id },
      {
        $set: {
          color: args.color,
        },
      },
      {
        upsert: true,
      }
    );

    const items: object[] = await cards.find({}).toArray();

    io.emit("BOX_LIST", items);
  });
  socket.on("CONTENT_BOX", async (args: any) => {
    await cards.updateOne(
      { id: args.id },
      {
        $set: {
          content: args.content,
        },
      },
      {
        upsert: true,
      }
    );

    const items: object[] = await cards.find({}).toArray();

    io.emit("BOX_LIST", items);
  });
  socket.on("MOVE_BOX", async (args: any) => {
    await cards.updateOne(
      { id: args.id },
      {
        $set: {
          x: args.x,
          y: args.y,
        },
      },
      {
        upsert: true,
      }
    );

    const items: object[] = await cards.find({}).toArray();

    io.emit("BOX_LIST", items);
  });
});

http.listen(port, async () => {
  try {
    client.connect().then(async () => {
      log("connected to db!");
    });

    log(`api running on ${port}`);
  } catch (error) {
    log(error);
  }
});
