export class Logger {
    constructor(private context: string) {}

    info(message: string) {
        console.log(`[${new Date().toISOString()}] [INFO] [${this.context}] ${message}`);
    }

    error(message: string) {
        console.error(`[${new Date().toISOString()}] [ERROR] [${this.context}] ${message}`);
    }
}