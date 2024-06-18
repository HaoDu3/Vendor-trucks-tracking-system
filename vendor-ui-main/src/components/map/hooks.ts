import { Vendor } from "@/api/types";
import {cloneDeep } from 'lodash'
import React from "react";

const deepCompareVendorTweets = (a: Vendor[] | undefined, b: Vendor[] | undefined) => {
    if (a && b && a.length === b.length) {
        return a.every((vendor: Vendor, i: number) => {
            return vendor.tweets.length === b[i].tweets.length;
        })
    }
    return false;
}

export const useDeepCompareVendorTweets = (vendors: Vendor[] | undefined) => {
    const ref = React.useRef<Vendor[] | undefined>();
    if (!deepCompareVendorTweets(vendors, ref.current)) {
        ref.current = cloneDeep(vendors);
    }
    return ref.current;
}