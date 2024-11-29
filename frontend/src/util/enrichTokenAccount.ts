import { getAllTokens } from "../api/getAssets";

getAllTokens().then((data) => {
    console.log(data);
});