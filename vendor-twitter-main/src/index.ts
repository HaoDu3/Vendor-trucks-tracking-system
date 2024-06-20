import dotenv from 'dotenv';
import { getAllScanResults } from './aws';
import { streamVendors } from './twitter';
import { Vendor } from './types/vendor';
import express from 'express';
import healthcheck from './healthcheck';

dotenv.config();

const init = async () => {
    try {
        const vendors = await getAllScanResults<Vendor>(process.env.AWS_VENDORS_TABLE_NAME ?? '');
        const vendorList = vendors.map(vendor => vendor.twitterId);
        await streamVendors(vendorList);

        const app = express();
        app.use('/', healthcheck);
        app.listen(process.env.PORT, () => console.log(`Healthcheck listening on port ${process.env.PORT}`))
    } catch(e) {
        if (e instanceof Error) {
            console.log(e.message);
            process.exit(1);
        }

        console.log('init unexpected error');
        process.exit(1);
    }

}

init()