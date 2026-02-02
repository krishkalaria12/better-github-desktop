import axios from "axios";
import { env } from "./env";

export const api = axios.create({
	baseURL: env.VITE_SERVER_URL,
	timeout: 30000,
	headers: {
    "Content-Type": "application/json",
		"Accept": "application/json",
	},
	withCredentials: true,
});
