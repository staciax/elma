import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));

app.get("/", (req: Request, res: Response) => {
  res.send("hi");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
