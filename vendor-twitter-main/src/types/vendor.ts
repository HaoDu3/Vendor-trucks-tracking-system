import { TweetFormatted } from "./twitter";

export interface Vendor {
    name: string,
    image: string,
    description: string,
    twitterId: string,
    tweets: TweetFormatted[],
    created: number,
    updated: number,
}