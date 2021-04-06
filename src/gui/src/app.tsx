import { GetInfo } from "./services/general";

export async function getInitialState() {
    const info = await GetInfo();
    return { info }
}