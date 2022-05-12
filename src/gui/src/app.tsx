import { GetInfo } from "./services/generalAPI";

export async function getInitialState() {
    const info = await GetInfo();
    return { info }
}