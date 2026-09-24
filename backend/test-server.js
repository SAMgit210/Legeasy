import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Backend service is working",
    status: "success"
  });
});

export default app;