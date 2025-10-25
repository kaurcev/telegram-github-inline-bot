// src/web-server.ts
import express from 'express';
import path from 'path';

export class WebServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private setupRoutes(): void {
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Web server running on port ${this.port}`);
      console.log(`Landing page: http://localhost:${this.port}`);
    });
  }
}