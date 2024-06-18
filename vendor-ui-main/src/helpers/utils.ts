import { Vendor } from "@/api/types";

export const vendorsSort = (vendors: Vendor[]) => vendors.sort((a,b) => {
    const a_date: number = a.tweets.length && new Date(a.tweets[0].date).getTime();
    const b_date: number = b.tweets.length && new Date(b.tweets[0].date).getTime();
    return b_date - a_date;
})
