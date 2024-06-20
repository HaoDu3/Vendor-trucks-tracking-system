import needle from 'needle';
import dotenv from 'dotenv';
import { Rule, TweetFormatted, TweetStream } from './types/twitter';
import { dynamodbUpdateTweet, sqsSendMessage } from './aws';

dotenv.config();

// ENV
const TOKEN = process.env.TWITTER_API_BEARER_TOKEN ?? '';
const AWS_VENDORS_TABLE_NAME = process.env.AWS_VENDORS_TABLE_NAME ?? '';
const AWS_SQS_URL = process.env.AWS_SQS_URL ?? '';

// URLS
const RULES_URL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const STREAM_URL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,edit_controls,edit_history_tweet_ids,entities,geo,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,promoted_metrics,public_metrics,referenced_tweets,reply_settings,source,text,withheld&expansions=attachments.media_keys,attachments.poll_ids,author_id,edit_history_tweet_ids,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id&media.fields=alt_text,duration_ms,height,media_key,non_public_metrics,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,variants,width&poll.fields=duration_minutes,end_datetime,id,options,voting_status&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type';

// Set rules for the Twitter stream
const setRules = async (rules: Rule[]) => {
    try {
        const res = await needle('post', RULES_URL, {
            'add': rules
        }, {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${TOKEN}`
            }
        })

        if (res.statusCode !== 201) {
            throw new Error(`setRules error response: ${res.statusCode} ${res.statusMessage}`);
        }

        console.log('Rules set!');
        return res.body;
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error('setRules unexpected error');
    }
}

const getAllRules = async () => {
    try {
        const res = await needle('get', RULES_URL, {
            headers: {
                'authorization': `Bearer ${TOKEN}`
            }
        })

        if (res.statusCode !== 200) {
            throw new Error(`getAllRules error response: ${res.statusCode} ${res.statusMessage}`)
        }

        return res.body;
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error('getAllRules unexpected error');
    }
}

const deleteAllRules = async (rules: any) => {
    try {
        if (!Array.isArray(rules.data)) {
            throw new Error('Invalid rules set passed in');
        }

        const ids = rules.data.map((rule: any) => rule.id);
        
        const params = {
            delete: { ids }
        }
        const res = await needle('post', RULES_URL, params, {
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${TOKEN}`
            }
        })

        if (res.statusCode !== 200) {
            throw new Error(`deleteAllRules error response: ${res.statusCode} ${res.statusMessage}`)
        }

        console.log('Rules deleted!');
        return res.body;
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error('deleteAllRules unexpected error');
    }
}

const parseTweet = (stream: TweetStream): TweetFormatted | Error => {
    try {
        console.log(JSON.stringify(stream));
        const user = stream.includes.users[0];
        const tweet = stream.includes.tweets[0];
        const place = stream.includes.places[0];

        return {
            id: tweet.id,
            userName: user.name,
            userId: user.username,
            text: tweet.text,
            date: tweet.created_at,
            geo: {
                id: place.id,
                name: place.name,
                full_name: place.full_name,
                place_type: place.place_type,
                country: place.country,
                country_code: place.country_code,
                coordinates: {
                    long: place.geo.bbox[0],
                    lat: place.geo.bbox[1],
                }
            }
        }
    } catch (e) {
        if (e instanceof Error) {
            return e;
        }
        
        throw new Error('parseTweet unexpected error');
    }
}

const connectStream = (retryAttempt: number = 0) => {
    const stream = needle.get(STREAM_URL, {
        headers: {
            'authorization': `Bearer ${TOKEN}`
        },
        timeout: 20000
    });

    stream.on('data', async data => {
        try {
            const json: TweetStream = JSON.parse(data);

            const parsedTweet = parseTweet(json);
            console.log('Tweet', parsedTweet);
            if (parsedTweet instanceof Error) {
                console.log('parseTweet error:', parsedTweet.message);
            } else {
                // Update the db
                const updatedTweetRes = await dynamodbUpdateTweet(AWS_VENDORS_TABLE_NAME, parsedTweet, parsedTweet.userId);
                if (updatedTweetRes instanceof Error) {
                    console.log('dynamodbUpdateTweet error:', updatedTweetRes.message);
                }
                // Send to SQS
                const sqsRes = await sqsSendMessage(AWS_SQS_URL, JSON.stringify(parsedTweet))
                if (sqsRes instanceof Error) {
                    console.log('sqsSendmessage error:', sqsRes.message);
                }
            }

            retryAttempt = 0;
        } catch(e) {
            if (data.status === 401) {
                console.log('error status 401', data);
                throw new Error('Error status 401')
            } else if (data.detail === 'This stream is currently at the maximum allowed connection limit.') {
                console.log('error', data.detail);
                throw new Error('Stream max limit');
            } else {
                // Do nothing, keep alive signal
            }
        }
    }).on('err', e => {
        console.log('error on', e.message);
        if (e.code !== 'ECONNRESET') {
            console.log('invalid error code', e.code);
            throw new Error('Invalid error code');
        } else {
            console.log('Twitter connection failed trying again, attempt:', retryAttempt);
            setTimeout(() => {
                connectStream(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;
}

export const streamVendors = async (vendorList: string[]) => {
    try {
        const currentRules = await getAllRules();
        if (currentRules.hasOwnProperty('data')) {
            await deleteAllRules(currentRules);
        }

        connectStream();

        const rules: Rule[] =[{
            value: `has:geo (from:${vendorList.join(' OR from:')})`,
            tag: 'vendors-geo'
        }];
        await setRules(rules);
    } catch(e) {
        if (e instanceof Error) {
            throw e;
        }

        throw new Error('streamVendors unexpected error');
    }
}
