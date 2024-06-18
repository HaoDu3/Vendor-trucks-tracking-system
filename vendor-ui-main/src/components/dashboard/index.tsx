import { Vendor, Vendors } from "@/api/types";
import { Dispatch, SetStateAction } from "react";
import styled from 'styled-components';
import Tile from "./tile";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "./loader";
import { getVendors } from "@/api/vendors";
import { vendorsSort } from "@/helpers/utils";

interface DashboardProps {
    vendors: Vendors;
    setVendors: Dispatch<SetStateAction<Vendors>>;
}

const DashboardStyled = styled.div`
    width: 400px;
    overflow: auto;
`;

export default function Dashboard({vendors, setVendors}: DashboardProps) {
    const next = async () => {
        try {
            const updatedVendors: Vendors = {
                Items: [...vendors.Items],
                count: 0,
                lastEvaluatedKey: null
            }

            const res = await getVendors<Vendors | Error>(1, vendors.lastEvaluatedKey ?? undefined) as Vendors;

            res.Items.forEach((newVendor: Vendor) => {
                updatedVendors.Items.push(newVendor)
            })

            updatedVendors.Items = vendorsSort(updatedVendors.Items)
            updatedVendors.count = vendors.count + res.count;
            updatedVendors.lastEvaluatedKey = res.lastEvaluatedKey;
            setVendors(updatedVendors);
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
            } else {
                throw new Error('getVendors unexpected error');
            }
        }
    }

    return (
        <DashboardStyled id="scrollableDiv">
            <InfiniteScroll
                dataLength={vendors.Items.length}
                next={next}
                hasMore={!!vendors.lastEvaluatedKey}
                scrollableTarget="scrollableDiv"
                loader={<Loader />}
            >
                {
                    vendors.Items.map(
                        vendor => (
                            <Tile key={vendor.twitterId} imgUrl={vendor.image} name={vendor.name} geo={vendor.tweets[vendor.tweets.length - 1]?.geo}/>
                        )
                    )
                }
            </InfiniteScroll>
        </DashboardStyled>
    )
}