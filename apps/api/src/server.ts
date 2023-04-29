import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";

export const createServer = () => {
  const app = express();
  app
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/health", (req, res) => {
      return res.json({ ok: true });
    });

  return app;
};
