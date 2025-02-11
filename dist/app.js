"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield db_1.default.connect();
        const result = yield client.query('SELECT $1::text as message', ['Hello, world!']);
        const message = result.rows[0].message;
        client.release();
        res.send(message);
    }
    catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
}));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
